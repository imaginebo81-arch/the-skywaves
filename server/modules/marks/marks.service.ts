import { supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";
import { writeAudit } from "../../lib/audit";
import { computeResult, gradeFor, type MarkRow } from "../../lib/result";
import { getPassPercentage } from "../settings/settings.service";
import { buildListResponse, range, type ListQuery } from "../../lib/pagination";

interface MarkJoinRow {
  id: string;
  subject_id: string;
  obtained_marks: number | null;
  subjects: {
    subject_name: string;
    min_marks: number;
    max_marks: number;
    display_order: number;
  } | null;
}

async function fetchMarkRows(rollNumber: string): Promise<{ id: string; mark: MarkRow }[]> {
  const { data, error } = await supabase
    .from("student_marks")
    .select("id, subject_id, obtained_marks, subjects(subject_name, min_marks, max_marks, display_order)")
    .eq("roll_number", rollNumber)
    .is("deleted_at", null);
  if (error) throw ApiError.internal("Failed to load marks");
  return ((data ?? []) as unknown as MarkJoinRow[])
    .map((r) => ({
      id: r.id,
      mark: {
        subjectId: r.subject_id,
        subjectName: r.subjects?.subject_name ?? "",
        obtainedMarks: r.obtained_marks,
        minMarks: r.subjects?.min_marks ?? 0,
        maxMarks: r.subjects?.max_marks ?? 100,
        displayOrder: r.subjects?.display_order ?? 0,
      },
    }))
    .sort((a, b) => a.mark.displayOrder - b.mark.displayOrder);
}

export async function getStudentMarks(rollNumber: string) {
  const rows = await fetchMarkRows(rollNumber);
  return {
    marks: rows.map((r) => ({ markId: r.id, ...r.mark })),
  };
}

export async function upsertStudentMarks(
  rollNumber: string,
  marks: { subjectId: string; obtainedMarks: number | null }[],
  actorId: string
) {
  const { data: student } = await supabase
    .from("students")
    .select("roll_number")
    .eq("roll_number", rollNumber)
    .is("deleted_at", null)
    .maybeSingle();
  if (!student) throw ApiError.notFound("Student not found");

  const prev = await fetchMarkRows(rollNumber);

  const rows = marks.map((m) => ({
    roll_number: rollNumber,
    subject_id: m.subjectId,
    obtained_marks: m.obtainedMarks,
  }));
  const { error } = await supabase
    .from("student_marks")
    .upsert(rows, { onConflict: "roll_number,subject_id" });
  if (error) throw ApiError.internal(`Failed to save marks: ${error.message}`);

  await writeAudit({
    actorId,
    action: "marks.update",
    entity: "student_marks",
    entityId: rollNumber,
    prevValue: prev.map((p) => ({ subjectId: p.mark.subjectId, obtainedMarks: p.mark.obtainedMarks })),
    newValue: marks,
  });

  return getStudentResult(rollNumber);
}

export async function getStudentResult(rollNumber: string) {
  const { data: student, error } = await supabase
    .from("students")
    .select("roll_number, name, father_name, mother_name, date_of_birth, course_id, start_date, end_date, profile_photo_path, courses(course_name)")
    .eq("roll_number", rollNumber)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw ApiError.internal("Failed to load student");
  if (!student) throw ApiError.notFound("Student not found");

  const rows = await fetchMarkRows(rollNumber);
  const passPercentage = await getPassPercentage();
  const summary = computeResult(rows.map((r) => r.mark), passPercentage);

  const course = (student as { courses?: { course_name?: string } | null }).courses;

  return {
    student: {
      rollNumber: student.roll_number,
      name: student.name,
      fatherName: (student as { father_name?: string }).father_name ?? null,
      motherName: (student as { mother_name?: string }).mother_name ?? null,
      dateOfBirth: (student as { date_of_birth?: string }).date_of_birth ?? null,
      courseName: course?.course_name ?? null,
      startDate: (student as { start_date?: string }).start_date ?? null,
      endDate: (student as { end_date?: string }).end_date ?? null,
    },
    marks: rows.map((r) => ({
      subjectName: r.mark.subjectName,
      obtainedMarks: r.mark.obtainedMarks,
      minMarks: r.mark.minMarks,
      maxMarks: r.mark.maxMarks,
    })),
    summary: {
      ...summary,
      passPercentage,
      grade: summary.passed ? gradeFor(summary.percentage) : "F",
    },
  };
}

export async function listAllMarks(query: ListQuery, courseId?: string) {
  let rollNumbers: string[] | null = null;
  if (courseId) {
    const { data: studs } = await supabase
      .from("students")
      .select("roll_number")
      .eq("course_id", courseId)
      .is("deleted_at", null);
    rollNumbers = (studs ?? []).map(s => s.roll_number as string);
    if (rollNumbers.length === 0) return buildListResponse([], 0, query.page, query.pageSize);
  }

  let builder = supabase
    .from("student_marks")
    .select(
      "id, roll_number, obtained_marks, students(name, course_id, deleted_at, courses(course_name)), subjects(subject_name, min_marks, max_marks, display_order)",
      { count: "exact" }
    )
    .is("deleted_at", null);

  if (rollNumbers) builder = builder.in("roll_number", rollNumbers);

  if (query.q) {
    const term = query.q.replace(/[%,]/g, " ").trim();
    builder = builder.ilike("roll_number", `%${term}%`);
  }

  const [from, to] = range(query.page, query.pageSize);
  const { data, error, count } = await builder.order("roll_number").range(from, to);
  if (error) throw ApiError.internal(`Failed to list marks: ${error.message}`);

  const items = (data ?? [])
    .map((r: unknown) => {
      const row = r as {
        id: string;
        roll_number: string;
        obtained_marks: number | null;
        students: { name: string; course_id: string; deleted_at: string | null; courses?: { course_name?: string } | null } | null;
        subjects: { subject_name: string; min_marks: number; max_marks: number; display_order: number } | null;
      };
      if (row.students?.deleted_at) return null;
      return {
        markId: row.id,
        rollNumber: row.roll_number,
        studentName: row.students?.name ?? "",
        courseId: row.students?.course_id ?? "",
        courseName: row.students?.courses?.course_name ?? null,
        subjectName: row.subjects?.subject_name ?? "",
        minMarks: row.subjects?.min_marks ?? 0,
        maxMarks: row.subjects?.max_marks ?? 100,
        obtainedMarks: row.obtained_marks,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return buildListResponse(items, count ?? 0, query.page, query.pageSize);
}

export async function deleteMarkById(markId: string, actorId: string) {
  const { data: existing } = await supabase
    .from("student_marks")
    .select("id, roll_number, subject_id, obtained_marks")
    .eq("id", markId)
    .maybeSingle();
  if (!existing) throw ApiError.notFound("Mark not found");

  const { error } = await supabase
    .from("student_marks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", markId);
  if (error) throw ApiError.internal("Failed to delete mark");

  await writeAudit({
    actorId,
    action: "marks.delete",
    entity: "student_marks",
    entityId: markId,
    prevValue: existing as unknown as Record<string, unknown>,
    newValue: null,
  });
}

export async function bulkUpdateMarksByName(
  entries: { rollNumber: string; subjectName: string; obtainedMarks: number | null }[],
  actorId: string
) {
  const byRoll = new Map<string, typeof entries>();
  for (const e of entries) {
    const list = byRoll.get(e.rollNumber) ?? [];
    list.push(e);
    byRoll.set(e.rollNumber, list);
  }
  let ok = 0;
  let fail = 0;
  for (const [rollNumber, rows] of byRoll.entries()) {
    try {
      const { marks } = await getStudentMarks(rollNumber);
      const nameToId = new Map(marks.map(m => [m.subjectName.toLowerCase(), m.subjectId]));
      const toSave = rows
        .map(r => {
          const subjectId = nameToId.get(r.subjectName.toLowerCase().trim());
          return subjectId ? { subjectId, obtainedMarks: r.obtainedMarks } : null;
        })
        .filter((m): m is { subjectId: string; obtainedMarks: number | null } => m !== null);
      if (toSave.length > 0) {
        await upsertStudentMarks(rollNumber, toSave, actorId);
        ok += toSave.length;
      } else {
        fail += rows.length;
      }
    } catch {
      fail += rows.length;
    }
  }
  return { ok, fail };
}
