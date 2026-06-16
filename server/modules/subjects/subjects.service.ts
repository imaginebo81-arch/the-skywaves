import { supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";
import { createCrud } from "../../lib/crud";

export interface SubjectDto {
  id: string;
  courseId: string;
  subjectName: string;
  minMarks: number;
  maxMarks: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

const SELECT =
  "id, course_id, subject_name, min_marks, max_marks, display_order, created_at, updated_at, deleted_at";

function toDto(row: Record<string, unknown>): SubjectDto {
  return {
    id: row.id as string,
    courseId: row.course_id as string,
    subjectName: row.subject_name as string,
    minMarks: Number(row.min_marks),
    maxMarks: Number(row.max_marks),
    displayOrder: Number(row.display_order),
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) ?? null,
    deletedAt: (row.deleted_at as string) ?? null,
  };
}

export const subjectsCrud = createCrud<SubjectDto>({
  table: "subjects",
  entity: "subject",
  pk: "id",
  selectColumns: SELECT,
  searchColumns: ["subject_name"],
  supportsArchive: false,
  defaultOrder: { column: "display_order", ascending: true },
  toDto,
});

export function toSubjectRow(input: {
  courseId?: string;
  subjectName?: string;
  minMarks?: number;
  maxMarks?: number;
  displayOrder?: number;
}) {
  const row: Record<string, unknown> = {};
  if (input.courseId !== undefined) row.course_id = input.courseId;
  if (input.subjectName !== undefined) row.subject_name = input.subjectName;
  if (input.minMarks !== undefined) row.min_marks = input.minMarks;
  if (input.maxMarks !== undefined) row.max_marks = input.maxMarks;
  if (input.displayOrder !== undefined) row.display_order = input.displayOrder;
  return row;
}

export async function listByCourse(courseId: string, includeArchived: boolean) {
  let builder = supabase.from("subjects").select(SELECT).eq("course_id", courseId);
  if (!includeArchived) builder = builder.is("deleted_at", null);
  const { data, error } = await builder.order("display_order", { ascending: true });
  if (error) throw ApiError.internal("Failed to load subjects");
  return (data ?? []).map((r) => toDto(r as Record<string, unknown>));
}
