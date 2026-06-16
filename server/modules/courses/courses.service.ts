import { supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";
import { createCrud } from "../../lib/crud";

export interface CourseDto {
  id: string;
  courseName: string;
  duration: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  archivedAt: string | null;
}

const SELECT = "id, course_name, duration, status, created_at, updated_at, deleted_at, archived_at";

function toDto(row: Record<string, unknown>): CourseDto {
  return {
    id: row.id as string,
    courseName: row.course_name as string,
    duration: (row.duration as string) ?? null,
    status: row.status as string,
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) ?? null,
    deletedAt: (row.deleted_at as string) ?? null,
    archivedAt: (row.archived_at as string) ?? null,
  };
}

export const coursesCrud = createCrud<CourseDto>({
  table: "courses",
  entity: "course",
  pk: "id",
  selectColumns: SELECT,
  searchColumns: ["course_name", "status"],
  toDto,
});

export function toCourseRow(input: { courseName?: string; duration?: string | null; status?: string }) {
  const row: Record<string, unknown> = {};
  if (input.courseName !== undefined) row.course_name = input.courseName;
  if (input.duration !== undefined) row.duration = input.duration;
  if (input.status !== undefined) row.status = input.status;
  return row;
}

export async function listPublicCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select(SELECT)
    .is("deleted_at", null)
    .is("archived_at", null)
    .eq("status", "active")
    .order("course_name", { ascending: true });
  if (error) throw ApiError.internal("Failed to load courses");
  return (data ?? []).map((r) => {
    const dto = toDto(r as Record<string, unknown>);
    return { id: dto.id, courseName: dto.courseName, duration: dto.duration };
  });
}
