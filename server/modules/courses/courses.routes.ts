import { Router } from "express";
import { z } from "zod";
import { asyncHandler, ok } from "../../lib/http";
import { buildCrudRouter } from "../../lib/crudRouter";
import { coursesCrud, listPublicCourses, toCourseRow } from "./courses.service";

const createSchema = z.object({
  courseName: z.string().trim().min(1).max(200),
  duration: z.string().trim().max(100).optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

const updateSchema = z.object({
  courseName: z.string().trim().min(1).max(200).optional(),
  duration: z.string().trim().max(100).optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const adminCoursesRouter = buildCrudRouter({
  crud: coursesCrud,
  createSchema,
  updateSchema,
  toRow: (input) => toCourseRow(input as never),
});

export const publicCoursesRouter = Router();
publicCoursesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    ok(res, { courses: await listPublicCourses() });
  })
);
