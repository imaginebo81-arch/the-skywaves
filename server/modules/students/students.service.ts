import { supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";
import { writeAudit } from "../../lib/audit";
import { buildListResponse, range, type ListQuery } from "../../lib/pagination";
import { signedPhotoUrl } from "../storage/storage.service";

const SELECT =
  "roll_number, registration_id, admission_number, name, father_name, mother_name, date_of_birth, address, contact_number, course_id, profile_photo_path, start_date, end_date, status, created_at, updated_at, deleted_at, archived_at";

export function toStudentDto(row: Record<string, unknown>) {
  return {
    rollNumber: row.roll_number as string,
    registrationId: (row.registration_id as string) ?? null,
    admissionNumber: (row.admission_number as string) ?? null,
    name: row.name as string,
    fatherName: (row.father_name as string) ?? null,
    motherName: (row.mother_name as string) ?? null,
    dateOfBirth: row.date_of_birth as string,
    address: (row.address as string) ?? null,
    contactNumber: (row.contact_number as string) ?? null,
    courseId: row.course_id as string,
    courseName: ((row.courses as { course_name?: string } | null)?.course_name) ?? null,
    profilePhotoPath: (row.profile_photo_path as string) ?? null,
    startDate: (row.start_date as string) ?? null,
    endDate: (row.end_date as string) ?? null,
    status: row.status as string,
    createdAt: row.created_at as string,
    deletedAt: (row.deleted_at as string) ?? null,
    archivedAt: (row.archived_at as string) ?? null,
  };
}

export function toStudentRow(input: Record<string, unknown>) {
  const map: Record<string, string> = {
    rollNumber: "roll_number",
    name: "name",
    fatherName: "father_name",
    motherName: "mother_name",
    dateOfBirth: "date_of_birth",
    address: "address",
    contactNumber: "contact_number",
    courseId: "course_id",
    startDate: "start_date",
    endDate: "end_date",
    status: "status",
  };
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (map[k]) row[map[k]] = v;
  }
  return row;
}

export async function listStudents(query: ListQuery) {
  let builder = supabase.from("students").select(`${SELECT}, courses(course_name)`, { count: "exact" });
  if (!query.includeArchived) builder = builder.is("deleted_at", null).is("archived_at", null);
  if (query.q) {
    const term = query.q.replace(/[%,]/g, " ").trim();
    builder = builder.or(
      `name.ilike.%${term}%,roll_number.ilike.%${term}%,admission_number.ilike.%${term}%`
    );
  }
  const [from, to] = range(query.page, query.pageSize);
  const { data, error, count } = await builder.order("created_at", { ascending: false }).range(from, to);
  if (error) throw ApiError.internal(`Failed to list students: ${error.message}`);
  const items = await Promise.all(
    (data ?? []).map(async (r) => {
      const dto = toStudentDto(r as Record<string, unknown>);
      return { ...dto, profilePhotoUrl: await signedPhotoUrl(dto.profilePhotoPath) };
    })
  );
  return buildListResponse(items, count, query.page, query.pageSize);
}

export async function getStudent(rollNumber: string) {
  const { data, error } = await supabase
    .from("students")
    .select(`${SELECT}, courses(course_name)`)
    .eq("roll_number", rollNumber)
    .maybeSingle();
  if (error) throw ApiError.internal("Failed to load student");
  if (!data) throw ApiError.notFound("Student not found");
  const dto = toStudentDto(data as Record<string, unknown>);
  return { ...dto, profilePhotoUrl: await signedPhotoUrl(dto.profilePhotoPath) };
}

export async function createStudent(input: Record<string, unknown>, actorId: string) {
  const row = toStudentRow(input);
  const { data, error } = await supabase.from("students").insert(row).select(SELECT).single();
  if (error) {
    if (error.code === "23505") throw ApiError.conflict("Roll number already in use");
    if (error.code === "23503") throw ApiError.badRequest("Selected course does not exist");
    throw ApiError.internal(`Failed to create student: ${error.message}`);
  }
  await syncMarksWithCourse(data.roll_number as string, data.course_id as string);
  await writeAudit({ actorId, action: "student.create", entity: "students", entityId: data.roll_number as string, newValue: data });
  return toStudentDto(data as Record<string, unknown>);
}

export async function updateStudent(rollNumber: string, input: Record<string, unknown>, actorId: string) {
  const { data: prev } = await supabase.from("students").select("*").eq("roll_number", rollNumber).maybeSingle();
  if (!prev) throw ApiError.notFound("Student not found");
  const row = toStudentRow(input);
  delete row.roll_number;
  const { data, error } = await supabase.from("students").update(row).eq("roll_number", rollNumber).select(SELECT).single();
  if (error) throw ApiError.internal(`Failed to update student: ${error.message}`);
  if (row.course_id && row.course_id !== prev.course_id) {
    await syncMarksWithCourse(rollNumber, row.course_id as string);
  }
  await writeAudit({ actorId, action: "student.update", entity: "students", entityId: rollNumber, prevValue: prev, newValue: data });
  return toStudentDto(data as Record<string, unknown>);
}

async function setFlag(rollNumber: string, column: "deleted_at" | "archived_at", value: string | null, action: string, actorId: string) {
  const { data: prev } = await supabase.from("students").select("*").eq("roll_number", rollNumber).maybeSingle();
  if (!prev) throw ApiError.notFound("Student not found");
  const { error } = await supabase.from("students").update({ [column]: value }).eq("roll_number", rollNumber);
  if (error) throw ApiError.internal(`Failed to ${action} student`);
  await writeAudit({ actorId, action: `student.${action}`, entity: "students", entityId: rollNumber, prevValue: prev });
  return { rollNumber };
}

export const archiveStudent = (r: string, a: string) => setFlag(r, "archived_at", new Date().toISOString(), "archive", a);
export const unarchiveStudent = (r: string, a: string) => setFlag(r, "archived_at", null, "unarchive", a);
export const deleteStudent = (r: string, a: string) => setFlag(r, "deleted_at", new Date().toISOString(), "delete", a);
export const restoreStudent = (r: string, a: string) => setFlag(r, "deleted_at", null, "restore", a);

async function syncMarksWithCourse(rollNumber: string, courseId: string) {
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id")
    .eq("course_id", courseId)
    .is("deleted_at", null);
  if (!subjects?.length) return;
  const rows = subjects.map((s) => ({ roll_number: rollNumber, subject_id: s.id, obtained_marks: null }));
  await supabase.from("student_marks").upsert(rows, { onConflict: "roll_number,subject_id", ignoreDuplicates: true });
}
