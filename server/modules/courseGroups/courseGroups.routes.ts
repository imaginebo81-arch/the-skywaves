import { Router } from "express";
import { z } from "zod";
import { asyncHandler, ok } from "../../lib/http";
import { buildCrudRouter } from "../../lib/crudRouter";
import { courseGroupsCrud, listPublicCourseGroups, toCourseGroupRow } from "./courseGroups.service";
import { signedPhotoUrl } from "../storage/storage.service";

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().nullable(),
  imagePath: z.string().trim().max(500).optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  imagePath: z.string().trim().max(500).optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
});

export const adminCourseGroupsRouter = buildCrudRouter({
  crud: courseGroupsCrud,
  createSchema,
  updateSchema,
  toRow: (input) => toCourseGroupRow(input as never),
});

export const publicCourseGroupsRouter = Router();
publicCourseGroupsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    ok(res, { groups: await listPublicCourseGroups((path) => signedPhotoUrl(path)) });
  })
);
