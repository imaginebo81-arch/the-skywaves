import { Router } from "express";
import { z } from "zod";
import { asyncHandler, ok } from "../../lib/http";
import { requireAdmin } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { parseListQuery } from "../../lib/pagination";
import { listByCourse, subjectsCrud, toSubjectRow } from "./subjects.service";

const createSchema = z
  .object({
    courseId: z.string().uuid(),
    subjectName: z.string().trim().min(1).max(200),
    minMarks: z.coerce.number().int().min(0).max(1000).default(35),
    maxMarks: z.coerce.number().int().min(1).max(1000).default(100),
    displayOrder: z.coerce.number().int().min(0).default(0),
    description: z.string().trim().max(5000).optional().nullable(),
    imagePath: z.string().trim().max(500).optional().nullable(),
  })
  .refine((v) => v.minMarks <= v.maxMarks, {
    message: "minMarks cannot exceed maxMarks",
    path: ["minMarks"],
  });

const updateSchema = z.object({
  subjectName: z.string().trim().min(1).max(200).optional(),
  minMarks: z.coerce.number().int().min(0).max(1000).optional(),
  maxMarks: z.coerce.number().int().min(1).max(1000).optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  imagePath: z.string().trim().max(500).optional().nullable(),
});

export const adminSubjectsRouter = Router();
adminSubjectsRouter.use(requireAdmin);

adminSubjectsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const courseId = typeof req.query.courseId === "string" ? req.query.courseId : null;
    const q = parseListQuery(req.query);
    if (courseId) {
      ok(res, { items: await listByCourse(courseId, q.includeArchived) });
      return;
    }
    ok(res, await subjectsCrud.list(q));
  })
);

adminSubjectsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    ok(res, await subjectsCrud.get(req.params.id));
  })
);

adminSubjectsRouter.post(
  "/",
  validate(createSchema),
  asyncHandler(async (req, res) => {
    ok(res, await subjectsCrud.create(toSubjectRow(req.body as never), req.admin!.sub), 201);
  })
);

adminSubjectsRouter.patch(
  "/:id",
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    ok(res, await subjectsCrud.update(req.params.id, toSubjectRow(req.body as never), req.admin!.sub));
  })
);

adminSubjectsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    ok(res, await subjectsCrud.softDelete(req.params.id, req.admin!.sub));
  })
);

adminSubjectsRouter.post(
  "/:id/restore",
  asyncHandler(async (req, res) => {
    ok(res, await subjectsCrud.restore(req.params.id, req.admin!.sub));
  })
);
