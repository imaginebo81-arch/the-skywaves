import { Router } from "express";
import { z } from "zod";
import { asyncHandler, ok } from "../../lib/http";
import { validate } from "../../middleware/validate";
import { requireAdmin } from "../../middleware/auth";
import { parseListQuery } from "../../lib/pagination";
import { listAllMarks, deleteMarkById, clearStudentMarks, bulkUpdateMarksByName, setStudentGrade } from "./marks.service";
import { writeAudit } from "../../lib/audit";

export const adminMarksRouter = Router();
adminMarksRouter.use(requireAdmin);

adminMarksRouter.get("/", asyncHandler(async (req, res) => {
  const query = parseListQuery(req.query);
  const courseId = typeof req.query.courseId === "string" ? req.query.courseId : undefined;
  ok(res, await listAllMarks(query, courseId));
}));

adminMarksRouter.delete("/student/:rollNumber", asyncHandler(async (req, res) => {
  await clearStudentMarks(req.params.rollNumber, req.admin!.sub);
  ok(res, { success: true });
}));

adminMarksRouter.delete("/:markId", asyncHandler(async (req, res) => {
  await deleteMarkById(req.params.markId, req.admin!.sub);
  ok(res, { success: true });
}));

const setGradeSchema = z.object({
  rollNumber: z.string().min(1),
  grade: z.string().nullable(),
});

adminMarksRouter.post("/set-grade", validate(setGradeSchema), asyncHandler(async (req, res) => {
  const { rollNumber, grade } = req.body as { rollNumber: string; grade: string | null };
  await setStudentGrade(rollNumber, grade, req.admin!.sub);
  ok(res, { success: true });
}));

const bulkSchema = z.object({
  entries: z.array(z.object({
    rollNumber: z.string().min(1),
    subjectName: z.string().optional().nullable(),
    obtainedMarks: z.coerce.number().min(0).max(1000).nullable().optional(),
    grade: z.string().optional().nullable(),
    courseGrade: z.string().optional().nullable(),
  })).min(1).max(1000),
});

adminMarksRouter.post("/bulk", validate(bulkSchema), asyncHandler(async (req, res) => {
  const { entries } = req.body as { entries: { rollNumber: string; subjectName?: string | null; obtainedMarks?: number | null; grade?: string | null; courseGrade?: string | null }[] };
  const result = await bulkUpdateMarksByName(entries, req.admin!.sub);
  await writeAudit({ actorId: req.admin!.sub, action: "marks.bulk_import", entity: "student_marks", entityId: "bulk", newValue: { ok: result.ok, fail: result.fail, count: entries.length } });
  ok(res, result);
}));
