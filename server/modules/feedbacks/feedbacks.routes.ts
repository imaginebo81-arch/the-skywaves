import { Router } from "express";
import { z } from "zod";
import { supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";
import { asyncHandler, ok } from "../../lib/http";
import { validate } from "../../middleware/validate";
import { requireAdmin } from "../../middleware/auth";
import { writeAudit } from "../../lib/audit";
import { buildListResponse, parseListQuery, range } from "../../lib/pagination";
import { sendFeedbackEmail } from "../../lib/email";
import { signedPhotoUrl } from "../storage/storage.service";

const submitSchema = z.object({
  name: z.string().trim().min(2).max(200),
  profession: z.string().trim().max(200).optional().nullable(),
  review: z.string().trim().min(10).max(2000),
  profile_photo_path: z.string().trim().max(500).optional().nullable(),
});

export const publicFeedbacksRouter = Router();
publicFeedbacksRouter.post(
  "/",
  validate(submitSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof submitSchema>;
    const { error } = await supabase.from("feedbacks").insert({
      name: body.name,
      profession: body.profession ?? null,
      review: body.review,
      profile_photo_path: body.profile_photo_path ?? null,
    });
    if (error) {
      console.error("[feedbacks] insert error:", error.message, error.details);
      throw ApiError.internal("Could not submit your review. Please try again.");
    }
    sendFeedbackEmail({ name: body.name!, profession: body.profession, review: body.review! }).catch(console.error);
    writeAudit({ actorId: "public", action: "public.feedback_submit", entity: "feedbacks", entityId: body.name }).catch(() => {});
    ok(res, { success: true }, 201);
  })
);

export const adminFeedbacksRouter = Router();
adminFeedbacksRouter.use(requireAdmin);

adminFeedbacksRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = parseListQuery(req.query);
    const statusFilter = typeof req.query.status === "string" ? req.query.status : null;
    let builder = supabase.from("feedbacks").select("*", { count: "exact" }).is("deleted_at", null);
    if (statusFilter) builder = builder.eq("status", statusFilter);
    if (q.q) {
      const term = q.q.replace(/[%,]/g, " ").trim();
      builder = builder.or(`name.ilike.%${term}%,review.ilike.%${term}%`);
    }
    const [from, to] = range(q.page, q.pageSize);
    const { data, error, count } = await builder.order("created_at", { ascending: false }).range(from, to);
    if (error) throw ApiError.internal("Failed to load feedbacks");
    const items = await Promise.all(
      (data ?? []).map(async (fb) => ({
        ...fb,
        photoUrl: await signedPhotoUrl((fb as Record<string, unknown>).profile_photo_path as string | null),
      }))
    );
    ok(res, buildListResponse(items, count, q.page, q.pageSize));
  })
);

const updateSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

adminFeedbacksRouter.patch(
  "/:id",
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const { status } = req.body as z.infer<typeof updateSchema>;

    const { data: feedback, error: fetchErr } = await supabase
      .from("feedbacks")
      .select("*")
      .eq("id", req.params.id)
      .single();
    if (fetchErr || !feedback) throw ApiError.notFound("Feedback not found");

    const { data, error } = await supabase
      .from("feedbacks")
      .update({ status })
      .eq("id", req.params.id)
      .select("*")
      .single();
    if (error) throw ApiError.internal("Failed to update feedback");

    if (status === "approved") {
      const { error: testErr } = await supabase.from("testimonials").insert({
        name: feedback.name,
        role: feedback.profession ?? null,
        quote: feedback.review,
        image_url: feedback.profile_photo_path ?? null,
        source: "feedback",
        feedback_id: feedback.id,
      });
      if (testErr) console.error("[feedbacks] Failed to create testimonial:", testErr.message);
    }

    await writeAudit({
      actorId: req.admin!.sub,
      action: "feedback.update",
      entity: "feedbacks",
      entityId: req.params.id,
      prevValue: { status: feedback.status },
      newValue: { status },
    });
    ok(res, data);
  })
);

adminFeedbacksRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { error } = await supabase
      .from("feedbacks")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", req.params.id);
    if (error) throw ApiError.internal("Failed to delete feedback");
    await writeAudit({
      actorId: req.admin!.sub,
      action: "feedback.delete",
      entity: "feedbacks",
      entityId: req.params.id,
    });
    ok(res, { id: req.params.id });
  })
);
