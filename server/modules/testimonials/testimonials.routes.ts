import { Router } from "express";
import { z } from "zod";
import { supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";
import { asyncHandler, ok } from "../../lib/http";
import { validate } from "../../middleware/validate";
import { requireAdmin } from "../../middleware/auth";
import { writeAudit } from "../../lib/audit";
import { buildListResponse, parseListQuery, range } from "../../lib/pagination";
import { signedPhotoUrl } from "../storage/storage.service";

function isStoragePath(url: string | null): boolean {
  return !!url && !url.startsWith("http://") && !url.startsWith("https://");
}

async function resolveImageUrl(url: string | null): Promise<string | null> {
  if (!url) return null;
  if (isStoragePath(url)) return signedPhotoUrl(url);
  return url;
}

export const publicTestimonialsRouter = Router();
publicTestimonialsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("id, name, role, quote, image_url, display_order")
      .is("deleted_at", null)
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw ApiError.internal("Failed to load testimonials");
    const items = await Promise.all(
      (data ?? []).map(async (t) => ({ ...t, image_url: await resolveImageUrl(t.image_url) }))
    );
    ok(res, { items });
  })
);

export const adminTestimonialsRouter = Router();
adminTestimonialsRouter.use(requireAdmin);

adminTestimonialsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = parseListQuery(req.query);
    let builder = supabase.from("testimonials").select("*", { count: "exact" }).is("deleted_at", null);
    if (q.q) {
      const term = q.q.replace(/[%,]/g, " ").trim();
      builder = builder.or(`name.ilike.%${term}%,quote.ilike.%${term}%`);
    }
    const [from, to] = range(q.page, q.pageSize);
    const { data, error, count } = await builder.order("display_order", { ascending: true }).range(from, to);
    if (error) throw ApiError.internal("Failed to load testimonials");
    const items = await Promise.all(
      (data ?? []).map(async (t) => ({ ...t, image_url: await resolveImageUrl(t.image_url) }))
    );
    ok(res, buildListResponse(items, count, q.page, q.pageSize));
  })
);

const createSchema = z.object({
  name: z.string().trim().min(2).max(200),
  role: z.string().trim().max(200).optional().nullable(),
  quote: z.string().trim().min(5).max(2000),
  image_url: z.string().trim().max(1000).optional().nullable(),
  display_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

adminTestimonialsRouter.post(
  "/",
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof createSchema>;
    const { data, error } = await supabase
      .from("testimonials")
      .insert({
        name: body.name,
        role: body.role ?? null,
        quote: body.quote,
        image_url: body.image_url ?? null,
        display_order: body.display_order,
        is_active: body.is_active,
        source: "manual",
      })
      .select("*")
      .single();
    if (error) throw ApiError.internal("Failed to create testimonial");
    await writeAudit({
      actorId: req.admin!.sub,
      action: "testimonial.create",
      entity: "testimonials",
      entityId: data.id,
      newValue: body,
    });
    ok(res, data, 201);
  })
);

const updateSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  role: z.string().trim().max(200).optional().nullable(),
  quote: z.string().trim().min(5).max(2000).optional(),
  image_url: z.string().trim().max(1000).optional().nullable(),
  display_order: z.coerce.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

adminTestimonialsRouter.patch(
  "/:id",
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof updateSchema>;
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.role !== undefined) updates.role = body.role;
    if (body.quote !== undefined) updates.quote = body.quote;
    if (body.image_url !== undefined) updates.image_url = body.image_url;
    if (body.display_order !== undefined) updates.display_order = body.display_order;
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    const { data, error } = await supabase
      .from("testimonials")
      .update(updates)
      .eq("id", req.params.id)
      .select("*")
      .single();
    if (error) throw ApiError.internal("Failed to update testimonial");
    await writeAudit({
      actorId: req.admin!.sub,
      action: "testimonial.update",
      entity: "testimonials",
      entityId: req.params.id,
      newValue: updates,
    });
    ok(res, data);
  })
);

adminTestimonialsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { error } = await supabase
      .from("testimonials")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", req.params.id);
    if (error) throw ApiError.internal("Failed to delete testimonial");
    await writeAudit({
      actorId: req.admin!.sub,
      action: "testimonial.delete",
      entity: "testimonials",
      entityId: req.params.id,
    });
    ok(res, { id: req.params.id });
  })
);
