import { Router } from "express";
import { z } from "zod";
import { asyncHandler, ok } from "../../lib/http";
import { validate } from "../../middleware/validate";
import { requireAdmin } from "../../middleware/auth";
import { parseListQuery } from "../../lib/pagination";
import { listAllMarks, deleteMarkById, bulkUpdateMarksByName } from "./marks.service";

export const adminMarksRouter = Router();
adminMarksRouter.use(requireAdmin);

adminMarksRouter.get("/", asyncHandler(async (req, res) => {
  const query = parseListQuery(req.query);
  const courseId = typeof req.query.courseId === "string" ? req.query.courseId : undefined;
  ok(res, await listAllMarks(query, courseId));
}));

adminMarksRouter.delete("/:markId", asyncHandler(async (req, res) => {
  await deleteMarkById(req.params.markId, req.admin!.sub);
  ok(res, { success: true });
}));

const bulkSchema = z.object({
  entries: z.array(z.object({
    rollNumber: z.string().min(1),
    subjectName: z.string().min(1),
    obtainedMarks: z.coerce.number().min(0).max(1000).nullable(),
  })).min(1).max(1000),
});

adminMarksRouter.post("/bulk", validate(bulkSchema), asyncHandler(async (req, res) => {
  const { entries } = req.body as { entries: { rollNumber: string; subjectName: string; obtainedMarks: number | null }[] };
  ok(res, await bulkUpdateMarksByName(entries, req.admin!.sub));
}));
