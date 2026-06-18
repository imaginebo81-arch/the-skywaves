import { Router } from "express";
import { z } from "zod";
import { supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";
import { asyncHandler, ok } from "../../lib/http";
import { validate } from "../../middleware/validate";
import { requireAdmin } from "../../middleware/auth";
import { writeAudit } from "../../lib/audit";
import { buildListResponse, parseListQuery, range } from "../../lib/pagination";
import { sendEnquiryEmail, sendUserConfirmationEmail } from "../../lib/email";

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200).optional().nullable(),
  phone: z.string().trim().max(20).optional().nullable(),
  course: z.string().trim().max(200).optional().nullable(),
  message: z.string().trim().max(2000).optional().nullable(),
  source: z.enum(["enquiry", "contact"]).default("enquiry"),
});

export const publicEnquiriesRouter = Router();
publicEnquiriesRouter.post(
  "/",
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof createSchema>;
    const { error } = await supabase.from("enquiries").insert({
      name: body.name,
      email: body.email ?? null,
      phone: body.phone ?? null,
      course: body.course ?? null,
      message: body.message ?? null,
      source: body.source,
    });
    if (error) throw ApiError.internal("Could not submit your message. Please try again.");
    sendEnquiryEmail({ name: body.name!, email: body.email, phone: body.phone, course: body.course, message: body.message, source: body.source! }).catch(console.error);
    if (body.email) sendUserConfirmationEmail(body.email, body.name!).catch(console.error);
    writeAudit({ actorId: "public", action: "public.enquiry_submit", entity: "enquiries", entityId: body.name, newValue: { course: body.course, source: body.source } }).catch(() => {});
    ok(res, { success: true }, 201);
  })
);

export const adminEnquiriesRouter = Router();
adminEnquiriesRouter.use(requireAdmin);

adminEnquiriesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = parseListQuery(req.query);
    let builder = supabase.from("enquiries").select("*", { count: "exact" });
    if (!q.includeArchived) builder = builder.is("deleted_at", null);
    if (q.q) {
      const term = q.q.replace(/[%,]/g, " ").trim();
      builder = builder.or(`name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`);
    }
    const [from, to] = range(q.page, q.pageSize);
    const { data, error, count } = await builder.order("created_at", { ascending: false }).range(from, to);
    if (error) throw ApiError.internal("Failed to load enquiries");
    ok(res, buildListResponse(data ?? [], count, q.page, q.pageSize));
  })
);

const updateSchema = z.object({ status: z.enum(["new", "read", "resolved"]) });

adminEnquiriesRouter.patch(
  "/:id",
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const { status } = req.body as z.infer<typeof updateSchema>;
    const { data, error } = await supabase
      .from("enquiries")
      .update({ status })
      .eq("id", req.params.id)
      .select("*")
      .single();
    if (error) throw ApiError.internal("Failed to update enquiry");
    await writeAudit({ actorId: req.admin!.sub, action: "enquiry.update", entity: "enquiries", entityId: req.params.id, newValue: { status } });
    ok(res, data);
  })
);

adminEnquiriesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { error } = await supabase
      .from("enquiries")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", req.params.id);
    if (error) throw ApiError.internal("Failed to delete enquiry");
    await writeAudit({ actorId: req.admin!.sub, action: "enquiry.delete", entity: "enquiries", entityId: req.params.id });
    ok(res, { id: req.params.id });
  })
);
