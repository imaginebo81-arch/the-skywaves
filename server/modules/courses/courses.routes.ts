import { Router } from "express";
import { z } from "zod";
import { asyncHandler, ok } from "../../lib/http";
import { buildCrudRouter } from "../../lib/crudRouter";
import { coursesCrud, getCoursesCatalog, listPublicCourses, toCourseRow } from "./courses.service";
import { signedPhotoUrl } from "../storage/storage.service";

const createSchema = z.object({
  courseName: z.string().trim().min(1).max(200),
  duration: z.string().trim().max(100).optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
  description: z.string().trim().max(5000).optional().nullable(),
  imagePath: z.string().trim().max(500).optional().nullable(),
  category: z.string().trim().max(100).optional().nullable(),
});

const updateSchema = z.object({
  courseName: z.string().trim().min(1).max(200).optional(),
  duration: z.string().trim().max(100).optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  imagePath: z.string().trim().max(500).optional().nullable(),
  category: z.string().trim().max(100).optional().nullable(),
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

publicCoursesRouter.get(
  "/catalog",
  asyncHandler(async (_req, res) => {
    const catalog = await getCoursesCatalog((path) => signedPhotoUrl(path));
    ok(res, { courses: catalog });
  })
);
