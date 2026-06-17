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
  category: string | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  archivedAt: string | null;
}

const SELECT =
  "id, course_name, duration, status, description, image_path, category, created_at, updated_at, deleted_at, archived_at";

function toDto(row: Record<string, unknown>): CourseDto {
  return {
    id: row.id as string,
    courseName: row.course_name as string,
    duration: (row.duration as string) ?? null,
    status: row.status as string,
    description: (row.description as string) ?? null,
    imagePath: (row.image_path as string) ?? null,
    category: (row.category as string) ?? null,
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
  category?: string | null;
}) {
  const row: Record<string, unknown> = {};
  if (input.courseName !== undefined) row.course_name = input.courseName;
  if (input.duration !== undefined) row.duration = input.duration;
  if (input.status !== undefined) row.status = input.status;
  if (input.description !== undefined) row.description = input.description;
  if (input.imagePath !== undefined) row.image_path = input.imagePath;
  if (input.category !== undefined) row.category = input.category;
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

export async function getCoursesCatalog(signUrl: (path: string) => Promise<string | null>) {
  const { data: courses, error: cErr } = await supabase
    .from("courses")
    .select(SELECT)
    .is("deleted_at", null)
    .is("archived_at", null)
    .eq("status", "active")
    .order("category", { ascending: true })
    .order("course_name", { ascending: true });
  if (cErr) throw ApiError.internal("Failed to load courses catalog");

  const courseIds = (courses ?? []).map((c) => c.id as string);
  const { data: subjects, error: sErr } = courseIds.length
    ? await supabase
        .from("subjects")
        .select("id, course_id, subject_name, description, image_path, display_order")
        .in("course_id", courseIds)
        .is("deleted_at", null)
        .order("display_order", { ascending: true })
    : { data: [], error: null };
  if (sErr) throw ApiError.internal("Failed to load subjects");

  const signJobs: { type: "course" | "subject"; idx: number; path: string }[] = [];
  for (let i = 0; i < (courses ?? []).length; i++) {
    const c = courses![i] as Record<string, unknown>;
    if (c.image_path) signJobs.push({ type: "course", idx: i, path: c.image_path as string });
  }
  const subjectMap: Record<string, { signedUrl: string | null; idx: number }> = {};
  for (let i = 0; i < (subjects ?? []).length; i++) {
    const s = subjects![i] as Record<string, unknown>;
    if (s.image_path) signJobs.push({ type: "subject", idx: i, path: s.image_path as string });
    const sid = s.id as string;
    subjectMap[sid] = { signedUrl: null, idx: i };
  }

  const signed = await Promise.all(signJobs.map((j) => signUrl(j.path)));

  const courseSignedUrls: Record<number, string | null> = {};
  const subjectSignedUrls: Record<number, string | null> = {};
  let k = 0;
  for (const job of signJobs) {
    if (job.type === "course") courseSignedUrls[job.idx] = signed[k];
    else subjectSignedUrls[job.idx] = signed[k];
    k++;
  }

  const subjectsByCourse: Record<string, unknown[]> = {};
  for (let i = 0; i < (subjects ?? []).length; i++) {
    const s = subjects![i] as Record<string, unknown>;
    const cid = s.course_id as string;
    if (!subjectsByCourse[cid]) subjectsByCourse[cid] = [];
    subjectsByCourse[cid].push({
      id: s.id,
      subjectName: s.subject_name,
      description: s.description ?? null,
      imageUrl: subjectSignedUrls[i] ?? null,
    });
  }

  return (courses ?? []).map((c, i) => {
    const dto = toDto(c as Record<string, unknown>);
    return {
      id: dto.id,
      courseName: dto.courseName,
      duration: dto.duration,
      description: dto.description,
      imageUrl: courseSignedUrls[i] ?? null,
      category: dto.category,
      subjects: subjectsByCourse[dto.id] ?? [],
    };
  });
}
