import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";
import { asyncHandler, ok } from "../../lib/http";
import { validate } from "../../middleware/validate";
import { requireAdmin, requireRole } from "../../middleware/auth";
import { writeAudit } from "../../lib/audit";

const SELECT = "id, username, display_name, role, is_active, last_login_at, created_at";

export const adminUsersRouter = Router();
adminUsersRouter.use(requireAdmin, requireRole("superadmin"));

adminUsersRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from("admin_users")
      .select(SELECT)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });
    if (error) throw ApiError.internal("Failed to load admin users");
    ok(res, { items: data ?? [] });
  })
);

const createSchema = z.object({
  username: z.string().trim().min(3).max(120),
  password: z.string().min(8).max(200),
  displayName: z.string().trim().max(200).optional().nullable(),
  role: z.enum(["superadmin", "admin"]).default("admin"),
});

adminUsersRouter.post(
  "/",
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof createSchema>;
    const passwordHash = await bcrypt.hash(body.password, 10);
    const { data, error } = await supabase
      .from("admin_users")
      .insert({
        username: body.username,
        password_hash: passwordHash,
        display_name: body.displayName ?? null,
        role: body.role,
      })
      .select(SELECT)
      .single();
    if (error) {
      if (error.code === "23505") throw ApiError.conflict("Username already exists");
      throw ApiError.internal("Failed to create admin user");
    }
    await writeAudit({ actorId: req.admin!.sub, action: "adminUser.create", entity: "admin_users", entityId: data.id, newValue: { username: data.username, role: data.role } });
    ok(res, data, 201);
  })
);

const updateSchema = z.object({
  displayName: z.string().trim().max(200).optional().nullable(),
  role: z.enum(["superadmin", "admin"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).max(200).optional(),
});

adminUsersRouter.patch(
  "/:id",
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof updateSchema>;
    const patch: Record<string, unknown> = {};
    if (body.displayName !== undefined) patch.display_name = body.displayName;
    if (body.role !== undefined) patch.role = body.role;
    if (body.isActive !== undefined) patch.is_active = body.isActive;
    if (body.password) patch.password_hash = await bcrypt.hash(body.password, 10);

    const { data, error } = await supabase
      .from("admin_users")
      .update(patch)
      .eq("id", req.params.id)
      .is("deleted_at", null)
      .select(SELECT)
      .single();
    if (error) throw ApiError.internal("Failed to update admin user");
    await writeAudit({ actorId: req.admin!.sub, action: "adminUser.update", entity: "admin_users", entityId: req.params.id, newValue: { ...patch, password_hash: undefined } });
    ok(res, data);
  })
);

adminUsersRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    if (req.params.id === req.admin!.sub) throw ApiError.badRequest("You cannot delete your own account");
    const { error } = await supabase
      .from("admin_users")
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq("id", req.params.id);
    if (error) throw ApiError.internal("Failed to delete admin user");
    await writeAudit({ actorId: req.admin!.sub, action: "adminUser.delete", entity: "admin_users", entityId: req.params.id });
    ok(res, { id: req.params.id });
  })
);
