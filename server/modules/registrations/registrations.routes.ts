import { Router } from "express";
import { z } from "zod";
import { asyncHandler, ok } from "../../lib/http";
import { validate } from "../../middleware/validate";
import { requireAdmin } from "../../middleware/auth";
import { parseListQuery } from "../../lib/pagination";
import {
  approveRegistration,
  createRegistration,
  getRegistration,
  listRegistrations,
  rejectRegistration,
  restoreRegistration,
  softDeleteRegistration,
} from "./registrations.service";

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  fatherName: z.string().trim().max(200).optional().nullable(),
  motherName: z.string().trim().max(200).optional().nullable(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  gender: z.enum(["Male", "Female", "Other"]).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  contactNumber: z.string().trim().min(5).max(20),
  courseId: z.string().uuid().optional().nullable(),
  profilePhotoPath: z.string().trim().max(300).optional().nullable(),
});

export const publicRegistrationsRouter = Router();
publicRegistrationsRouter.post(
  "/",
  validate(createSchema),
  asyncHandler(async (req, res) => {
    ok(res, await createRegistration(req.body as never), 201);
  })
);

const approveSchema = z.object({
  rollNumber: z.string().trim().min(1).max(60),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

export const adminRegistrationsRouter = Router();
adminRegistrationsRouter.use(requireAdmin);

adminRegistrationsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    ok(res, await listRegistrations(parseListQuery(req.query), status));
  })
);

adminRegistrationsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    ok(res, await getRegistration(req.params.id));
  })
);

adminRegistrationsRouter.post(
  "/:id/approve",
  validate(approveSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof approveSchema>;
    ok(res, await approveRegistration(req.params.id, body.rollNumber, req.admin!.sub, body.startDate, body.endDate));
  })
);

adminRegistrationsRouter.post(
  "/:id/reject",
  asyncHandler(async (req, res) => {
    ok(res, await rejectRegistration(req.params.id, req.admin!.sub));
  })
);

adminRegistrationsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    ok(res, await softDeleteRegistration(req.params.id, req.admin!.sub));
  })
);

adminRegistrationsRouter.post(
  "/:id/restore",
  asyncHandler(async (req, res) => {
    ok(res, await restoreRegistration(req.params.id, req.admin!.sub));
  })
);
