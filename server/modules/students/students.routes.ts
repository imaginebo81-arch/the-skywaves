import { Router } from "express";
import { z } from "zod";
import { asyncHandler, ok } from "../../lib/http";
import { validate } from "../../middleware/validate";
import { requireAdmin } from "../../middleware/auth";
import { parseListQuery } from "../../lib/pagination";
import {
  archiveStudent,
  createStudent,
  deleteStudent,
  getStudent,
  listStudents,
  restoreStudent,
  unarchiveStudent,
  updateStudent,
} from "./students.service";
import { getStudentMarks, getStudentResult, upsertStudentMarks } from "../marks/marks.service";
import { signResultToken } from "../../lib/tokens";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const createSchema = z.object({
  rollNumber: z.string().trim().min(1).max(60),
  name: z.string().trim().min(1).max(200),
  fatherName: z.string().trim().max(200).optional().nullable(),
  motherName: z.string().trim().max(200).optional().nullable(),
  dateOfBirth: dateStr,
  address: z.string().trim().max(500).optional().nullable(),
  contactNumber: z.string().trim().max(20).optional().nullable(),
  courseId: z.string().uuid(),
  profilePhotoPath: z.string().optional().nullable(),
  startDate: dateStr.optional().nullable(),
  endDate: dateStr.optional().nullable(),
  status: z.enum(["active", "inactive", "completed"]).default("active"),
});

const updateSchema = createSchema.partial();

const marksSchema = z.object({
  marks: z.array(
    z.object({
      subjectId: z.string().uuid(),
      obtainedMarks: z.coerce.number().min(0).max(1000).nullable(),
    })
  ),
});

type MarkInput = { subjectId: string; obtainedMarks: number | null };

export const adminStudentsRouter = Router();
adminStudentsRouter.use(requireAdmin);

adminStudentsRouter.get("/", asyncHandler(async (req, res) => {
  ok(res, await listStudents(parseListQuery(req.query)));
}));

adminStudentsRouter.post("/", validate(createSchema), asyncHandler(async (req, res) => {
  ok(res, await createStudent(req.body as never, req.admin!.sub), 201);
}));

adminStudentsRouter.get("/:rollNumber", asyncHandler(async (req, res) => {
  ok(res, await getStudent(req.params.rollNumber));
}));

adminStudentsRouter.patch("/:rollNumber", validate(updateSchema), asyncHandler(async (req, res) => {
  ok(res, await updateStudent(req.params.rollNumber, req.body as never, req.admin!.sub));
}));

adminStudentsRouter.delete("/:rollNumber", asyncHandler(async (req, res) => {
  ok(res, await deleteStudent(req.params.rollNumber, req.admin!.sub));
}));

adminStudentsRouter.post("/:rollNumber/restore", asyncHandler(async (req, res) => {
  ok(res, await restoreStudent(req.params.rollNumber, req.admin!.sub));
}));

adminStudentsRouter.post("/:rollNumber/archive", asyncHandler(async (req, res) => {
  ok(res, await archiveStudent(req.params.rollNumber, req.admin!.sub));
}));

adminStudentsRouter.post("/:rollNumber/unarchive", asyncHandler(async (req, res) => {
  ok(res, await unarchiveStudent(req.params.rollNumber, req.admin!.sub));
}));

adminStudentsRouter.get("/:rollNumber/marks", asyncHandler(async (req, res) => {
  ok(res, await getStudentMarks(req.params.rollNumber));
}));

adminStudentsRouter.put("/:rollNumber/marks", validate(marksSchema), asyncHandler(async (req, res) => {
  const body = req.body as { marks: MarkInput[] };
  ok(res, await upsertStudentMarks(req.params.rollNumber, body.marks, req.admin!.sub));
}));

adminStudentsRouter.get("/:rollNumber/result", asyncHandler(async (req, res) => {
  ok(res, await getStudentResult(req.params.rollNumber));
}));

adminStudentsRouter.get("/:rollNumber/result-token", asyncHandler(async (req, res) => {
  await getStudentResult(req.params.rollNumber);
  ok(res, { token: signResultToken(req.params.rollNumber) });
}));
