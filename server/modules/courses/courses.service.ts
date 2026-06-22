import { supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";
import { createCrud } from "../../lib/crud";

export interface CourseDto {
  id: string;
  courseName: string;
  duration: string | null;
  status: string;
  description: string | null;
  imagePath: string | null;
  courseGroupId: string | null;
  frontendVisible: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  archivedAt: string | null;
}

const SELECT =
  "id, course_name, duration, status, description, image_path, course_group_id, frontend_visible, created_at, updated_at, deleted_at, archived_at";

function toDto(row: Record<string, unknown>): CourseDto {
  return {
    id: row.id as string,
    courseName: row.course_name as string,
    duration: (row.duration as string) ?? null,
    status: row.status as string,
    description: (row.description as string) ?? null,
    imagePath: (row.image_path as string) ?? null,
    courseGroupId: (row.course_group_id as string) ?? null,
    frontendVisible: Boolean(row.frontend_visible),
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

export function toCourseRow(input: {
  courseName?: string;
  duration?: string | null;
  status?: string;
  description?: string | null;
  imagePath?: string | null;
  courseGroupId?: string | null;
  frontendVisible?: boolean;
}) {
  const row: Record<string, unknown> = {};
  if (input.courseName !== undefined) row.course_name = input.courseName;
  if (input.duration !== undefined) row.duration = input.duration;
  if (input.status !== undefined) row.status = input.status;
  if (input.description !== undefined) row.description = input.description;
  if (input.imagePath !== undefined) row.image_path = input.imagePath;
  if (input.courseGroupId !== undefined) row.course_group_id = input.courseGroupId;
  if (input.frontendVisible !== undefined) row.frontend_visible = input.frontendVisible;
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

// Public catalog: frontend-visible, active courses that belong to an active course group.
// Subjects are never exposed. Each item carries its course group as the public category.
export async function getCoursesCatalog(signUrl: (path: string) => Promise<string | null>) {
  const { data: groups, error: gErr } = await supabase
    .from("course_groups")
    .select("id, name")
    .is("deleted_at", null)
    .is("archived_at", null)
    .eq("status", "active");
  if (gErr) throw ApiError.internal("Failed to load course groups");

  const groupMap = new Map<string, string>();
  for (const g of groups ?? []) groupMap.set(g.id as string, g.name as string);
  if (groupMap.size === 0) return [];

  const { data: courses, error: cErr } = await supabase
    .from("courses")
    .select("id, course_name, description, image_path, duration, course_group_id")
    .is("deleted_at", null)
    .is("archived_at", null)
    .eq("status", "active")
    .eq("frontend_visible", true)
    .in("course_group_id", [...groupMap.keys()])
    .order("course_name", { ascending: true });
  if (cErr) throw ApiError.internal("Failed to load courses catalog");

  const signed = await Promise.all(
    (courses ?? []).map((c) => {
      const p = c.image_path as string | null;
      return p ? signUrl(p) : Promise.resolve(null);
    })
  );

  return (courses ?? []).map((c, i) => {
    const groupId = c.course_group_id as string;
    return {
      id: c.id as string,
      courseName: c.course_name as string,
      description: (c.description as string) ?? null,
      imageUrl: signed[i] ?? null,
      duration: (c.duration as string) ?? null,
      groupId,
      groupName: groupMap.get(groupId) ?? "",
    };
  });
}
