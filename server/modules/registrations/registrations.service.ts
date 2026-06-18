import { supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";
import { writeAudit } from "../../lib/audit";
import { buildListResponse, range, type ListQuery } from "../../lib/pagination";
import { signedPhotoUrl } from "../storage/storage.service";

const SELECT =
  "id, admission_number, admission_date, name, father_name, mother_name, date_of_birth, gender, address, contact_number, course_id, profile_photo_path, status, student_roll_number, created_at, archived_at, deleted_at";

interface RegInput {
  name: string;
  fatherName?: string | null;
  motherName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  contactNumber: string;
  courseId?: string | null;
  profilePhotoPath?: string | null;
}

function toDto(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    admissionNumber: row.admission_number as string,
    admissionDate: row.admission_date as string,
    name: row.name as string,
    fatherName: (row.father_name as string) ?? null,
    motherName: (row.mother_name as string) ?? null,
    dateOfBirth: (row.date_of_birth as string) ?? null,
    gender: (row.gender as string) ?? null,
    address: (row.address as string) ?? null,
    contactNumber: (row.contact_number as string) ?? null,
    courseId: (row.course_id as string) ?? null,
    courseName: ((row.courses as { course_name?: string } | null)?.course_name) ?? null,
    profilePhotoPath: (row.profile_photo_path as string) ?? null,
    status: row.status as string,
    studentRollNumber: (row.student_roll_number as string) ?? null,
    createdAt: row.created_at as string,
    archivedAt: (row.archived_at as string) ?? null,
    deletedAt: (row.deleted_at as string) ?? null,
  };
}

export async function createRegistration(input: RegInput) {
  const { data, error } = await supabase
    .from("registrations")
    .insert({
      name: input.name,
      father_name: input.fatherName ?? null,
      mother_name: input.motherName ?? null,
      date_of_birth: input.dateOfBirth ?? null,
      gender: input.gender ?? null,
      address: input.address ?? null,
      contact_number: input.contactNumber,
      course_id: input.courseId ?? null,
      profile_photo_path: input.profilePhotoPath ?? null,
    })
    .select("id, admission_number, admission_date")
    .single();
  if (error) {
    if (error.code === "23503") throw ApiError.badRequest("Selected course does not exist");
    throw ApiError.internal(`Registration failed: ${error.message}`);
  }
  return {
    id: data.id,
    admissionNumber: data.admission_number,
    admissionDate: data.admission_date,
  };
}

export async function listRegistrations(query: ListQuery, status?: string) {
  let builder = supabase
    .from("registrations")
    .select(`${SELECT}, courses(course_name)`, { count: "exact" });

  if (!query.includeArchived) builder = builder.is("deleted_at", null).is("archived_at", null);
  if (status) builder = builder.eq("status", status);
  if (query.q) {
    const term = query.q.replace(/[%,]/g, " ").trim();
    builder = builder.or(
      `name.ilike.%${term}%,admission_number.ilike.%${term}%,contact_number.ilike.%${term}%`
    );
  }

  const [from, to] = range(query.page, query.pageSize);
  const { data, error, count } = await builder.order("created_at", { ascending: false }).range(from, to);
  if (error) throw ApiError.internal(`Failed to list registrations: ${error.message}`);

  const items = await Promise.all(
    (data ?? []).map(async (r) => {
      const dto = toDto(r as Record<string, unknown>);
      return { ...dto, profilePhotoUrl: await signedPhotoUrl(dto.profilePhotoPath) };
    })
  );
  return buildListResponse(items, count, query.page, query.pageSize);
}

export async function getRegistration(id: string) {
  const { data, error } = await supabase
    .from("registrations")
    .select(`${SELECT}, courses(course_name)`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw ApiError.internal("Failed to load registration");
  if (!data) throw ApiError.notFound("Registration not found");
  const dto = toDto(data as Record<string, unknown>);
  return { ...dto, profilePhotoUrl: await signedPhotoUrl(dto.profilePhotoPath) };
}

export async function approveRegistration(
  id: string,
  rollNumber: string,
  actorId: string,
  startDate?: string | null,
  endDate?: string | null
) {
  const { data: reg } = await supabase
    .from("registrations")
    .select("course_id")
    .eq("id", id)
    .maybeSingle();

  const { data, error } = await supabase.rpc("approve_registration", {
    p_registration_id: id,
    p_roll_number: rollNumber,
    p_actor: actorId,
    p_start_date: startDate ?? null,
    p_end_date: endDate ?? null,
  });
  if (error) {
    if (error.code === "23505") throw ApiError.conflict("That roll number is already in use");
    if (error.code === "P0002") throw ApiError.notFound("Registration not found");
    if (error.code === "P0001") throw ApiError.conflict("Registration already approved");
    throw ApiError.internal(`Approval failed: ${error.message}`);
  }

  if (reg?.course_id) {
    const { syncMarksWithCourse } = await import("../students/students.service");
    await syncMarksWithCourse(rollNumber, reg.course_id as string).catch(() => {});
  }

  return { rollNumber, student: data };
}

export async function rejectRegistration(id: string, actorId: string) {
  const { data: prev } = await supabase.from("registrations").select("*").eq("id", id).maybeSingle();
  if (!prev) throw ApiError.notFound("Registration not found");
  const { data, error } = await supabase
    .from("registrations")
    .update({ status: "rejected", archived_at: new Date().toISOString() })
    .eq("id", id)
    .select(SELECT)
    .single();
  if (error) throw ApiError.internal("Failed to reject registration");
  await writeAudit({
    actorId,
    action: "registration.reject",
    entity: "registrations",
    entityId: id,
    prevValue: prev,
    newValue: data,
  });
  return toDto(data as Record<string, unknown>);
}

export async function softDeleteRegistration(id: string, actorId: string) {
  const { data: prev } = await supabase.from("registrations").select("*").eq("id", id).maybeSingle();
  if (!prev) throw ApiError.notFound("Registration not found");
  const { error } = await supabase
    .from("registrations")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw ApiError.internal("Failed to delete registration");
  await writeAudit({
    actorId,
    action: "registration.delete",
    entity: "registrations",
    entityId: id,
    prevValue: prev,
  });
  return { id };
}

export async function restoreRegistration(id: string, actorId: string) {
  const { error } = await supabase
    .from("registrations")
    .update({ deleted_at: null })
    .eq("id", id);
  if (error) throw ApiError.internal("Failed to restore registration");
  await writeAudit({ actorId, action: "registration.restore", entity: "registrations", entityId: id });
  return { id };
}
