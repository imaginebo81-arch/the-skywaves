import { z } from "zod";
import { Router } from "express";
import { asyncHandler, ok } from "../../lib/http";
import { validate } from "../../middleware/validate";
import { requireAdmin } from "../../middleware/auth";
import { parseListQuery } from "../../lib/pagination";
import { employeesCrud, toEmployeeRow, signEmployeePhoto } from "./employees.service";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const createSchema = z.object({
  employmentReferenceNumber: z.string().trim().min(1).max(60),
  name: z.string().trim().min(1).max(200),
  fatherName: z.string().trim().max(200).optional().nullable(),
  dateOfBirth: dateStr,
  address: z.string().trim().max(500).optional().nullable(),
  joiningDate: dateStr.optional().nullable(),
  leavingDate: dateStr.optional().nullable(),
  designation: z.string().trim().max(200).optional().nullable(),
  certificateTemplateVariables: z.record(z.string(), z.unknown()).optional(),
  certificateMarkdown: z.string().optional().nullable(),
  profilePhotoPath: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

const updateSchema = createSchema.partial().omit({ employmentReferenceNumber: true });

export const adminEmployeesRouter = Router();
adminEmployeesRouter.use(requireAdmin);

adminEmployeesRouter.get("/", asyncHandler(async (req, res) => {
  const result = await employeesCrud.list(parseListQuery(req.query));
  const items = await Promise.all(result.items.map(signEmployeePhoto));
  ok(res, { ...result, items });
}));

adminEmployeesRouter.get("/:id", asyncHandler(async (req, res) => {
  const dto = await employeesCrud.get(req.params.id);
  ok(res, await signEmployeePhoto(dto));
}));

adminEmployeesRouter.post("/", validate(createSchema), asyncHandler(async (req, res) => {
  const row = toEmployeeRow(req.body as Record<string, unknown>);
  const dto = await employeesCrud.create(row, req.admin!.sub);
  ok(res, await signEmployeePhoto(dto), 201);
}));

adminEmployeesRouter.patch("/:id", validate(updateSchema), asyncHandler(async (req, res) => {
  const row = toEmployeeRow(req.body as Record<string, unknown>);
  const dto = await employeesCrud.update(req.params.id, row, req.admin!.sub);
  ok(res, await signEmployeePhoto(dto));
}));

adminEmployeesRouter.delete("/:id", asyncHandler(async (req, res) => {
  ok(res, await employeesCrud.softDelete(req.params.id, req.admin!.sub));
}));

adminEmployeesRouter.post("/:id/restore", asyncHandler(async (req, res) => {
  ok(res, await employeesCrud.restore(req.params.id, req.admin!.sub));
}));

adminEmployeesRouter.post("/:id/archive", asyncHandler(async (req, res) => {
  ok(res, await employeesCrud.archive(req.params.id, req.admin!.sub));
}));

adminEmployeesRouter.post("/:id/unarchive", asyncHandler(async (req, res) => {
  ok(res, await employeesCrud.unarchive(req.params.id, req.admin!.sub));
}));
