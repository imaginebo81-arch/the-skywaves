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
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  archivedAt: string | null;
}

const SELECT =
  "id, course_name, duration, status, description, image_path, created_at, updated_at, deleted_at, archived_at";

function toDto(row: Record<string, unknown>): CourseDto {
  return {
    id: row.id as string,
    courseName: row.course_name as string,
    duration: (row.duration as string) ?? null,
    status: row.status as string,
    description: (row.description as string) ?? null,
    imagePath: (row.image_path as string) ?? null,
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
}) {
  const row: Record<string, unknown> = {};
  if (input.courseName !== undefined) row.course_name = input.courseName;
  if (input.duration !== undefined) row.duration = input.duration;
  if (input.status !== undefined) row.status = input.status;
  if (input.description !== undefined) row.description = input.description;
  if (input.imagePath !== undefined) row.image_path = input.imagePath;
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

// Returns catalog items: subjects (each tagged with parent courseName) plus bare courses that
// have no subjects yet. Bare courses appear with isCourse=true so the frontend can distinguish.
export async function getCoursesCatalog(signUrl: (path: string) => Promise<string | null>) {
  const { data: courses, error: cErr } = await supabase
    .from("courses")
    .select("id, course_name, description, image_path, duration")
    .is("deleted_at", null)
    .is("archived_at", null)
    .eq("status", "active");
  if (cErr) throw ApiError.internal("Failed to load courses catalog");

  const courseIds = (courses ?? []).map((c) => c.id as string);
  if (!courseIds.length) return [];

  const { data: subjects, error: sErr } = await supabase
    .from("subjects")
    .select("id, course_id, subject_name, description, image_path, duration, display_order")
    .in("course_id", courseIds)
    .is("deleted_at", null)
    .order("display_order", { ascending: true });
  if (sErr) throw ApiError.internal("Failed to load subjects");

  type CourseInfo = { name: string; description: string | null; imagePath: string | null; duration: string | null };
  const courseMap: Record<string, CourseInfo> = {};
  for (const c of courses ?? []) {
    courseMap[c.id as string] = {
      name: c.course_name as string,
      description: (c.description as string) ?? null,
      imagePath: (c.image_path as string) ?? null,
      duration: (c.duration as string) ?? null,
    };
  }

  const coursesWithSubjects = new Set((subjects ?? []).map((s) => s.course_id as string));

  // Sign subject images
  const signedSubject = await Promise.all(
    (subjects ?? []).map((s) => {
      const p = s.image_path as string | null;
      return p ? signUrl(p) : Promise.resolve(null);
    })
  );

  const subjectItems = (subjects ?? []).map((s, i) => ({
    id: s.id as string,
    subjectName: s.subject_name as string,
    description: (s.description as string) ?? null,
    imageUrl: signedSubject[i] ?? null,
    duration: (s.duration as string) ?? null,
    courseId: s.course_id as string,
    courseName: courseMap[s.course_id as string]?.name ?? "",
    isCourse: false as const,
  }));

  // Courses with no subjects — shown as top-level catalog cards
  const bareCourseIds = courseIds.filter((id) => !coursesWithSubjects.has(id));
  const signedCourse = await Promise.all(
    bareCourseIds.map((id) => {
      const p = courseMap[id]?.imagePath ?? null;
      return p ? signUrl(p) : Promise.resolve(null);
    })
  );

  const bareCourseItems = bareCourseIds.map((id, i) => ({
    id,
    subjectName: courseMap[id]?.name ?? "",
    description: courseMap[id]?.description ?? null,
    imageUrl: signedCourse[i] ?? null,
    duration: courseMap[id]?.duration ?? null,
    courseId: id,
    courseName: courseMap[id]?.name ?? "",
    isCourse: true as const,
  }));

  return [...subjectItems, ...bareCourseItems];
}
