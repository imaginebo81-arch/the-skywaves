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
  grade: string | null;
  subjects: {
    subject_name: string;
    min_marks: number;
    max_marks: number;
    display_order: number;
    status: string | null;
    deleted_at: string | null;
  } | null;
}

function isSubjectActive(subject: MarkJoinRow["subjects"]): boolean {
  return !!subject && subject.deleted_at == null && (subject.status ?? "active") === "active";
}

async function fetchMarkRows(rollNumber: string): Promise<{ id: string; mark: MarkRow }[]> {
  const { data, error } = await supabase
    .from("student_marks")
    .select("id, subject_id, obtained_marks, grade, subjects(subject_name, min_marks, max_marks, display_order, status, deleted_at)")
    .eq("roll_number", rollNumber)
    .is("deleted_at", null);
  if (error) throw ApiError.internal("Failed to load marks");
  return ((data ?? []) as unknown as MarkJoinRow[])
    .filter((r) => isSubjectActive(r.subjects))
    .map((r) => ({
      id: r.id,
      mark: {
        subjectId: r.subject_id,
        subjectName: r.subjects?.subject_name ?? "",
        obtainedMarks: r.obtained_marks,
        grade: r.grade,
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
  marks: { subjectId: string; obtainedMarks: number | null; grade?: string | null }[],
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
    ...(m.grade !== undefined && { grade: m.grade }),
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

export async function setStudentGrade(rollNumber: string, grade: string | null, actorId: string) {
  const { data: existing } = await supabase
    .from("students")
    .select("roll_number, grade")
    .eq("roll_number", rollNumber)
    .is("deleted_at", null)
    .maybeSingle();
  if (!existing) throw ApiError.notFound("Student not found");
  const { error } = await supabase.from("students").update({ grade }).eq("roll_number", rollNumber);
  if (error) throw ApiError.internal(`Failed to update grade: ${error.message}`);
  await writeAudit({
    actorId,
    action: "marks.set_grade",
    entity: "students",
    entityId: rollNumber,
    prevValue: { grade: (existing as { grade?: string | null }).grade ?? null },
    newValue: { grade },
  });
}

export async function getStudentResult(rollNumber: string) {
  const { data: student, error } = await supabase
    .from("students")
    .select("roll_number, name, father_name, mother_name, date_of_birth, course_id, start_date, end_date, profile_photo_path, grade, courses(course_name)")
    .eq("roll_number", rollNumber)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw ApiError.internal("Failed to load student");
  if (!student) throw ApiError.notFound("Student not found");

  const rows = await fetchMarkRows(rollNumber);
  const passPercentage = await getPassPercentage();
  const summary = computeResult(rows.map((r) => r.mark), passPercentage);

  const course = (student as { courses?: { course_name?: string } | null }).courses;
  const courseGrade = (student as { grade?: string | null }).grade ?? null;

  const allMarksEntered = rows.length > 0 && rows.every((r) => r.mark.obtainedMarks !== null);
  const resultType: "marksheet" | "gradecard" | "pending" = courseGrade != null
    ? "gradecard"
    : allMarksEntered
      ? "marksheet"
      : "pending";

  const { signedPhotoUrl } = await import("../storage/storage.service");
  const profilePhotoUrl = await signedPhotoUrl(
    (student as { profile_photo_path?: string | null }).profile_photo_path ?? null
  );

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
      profilePhotoUrl,
    },
    marks: rows.map((r) => ({
      subjectName: r.mark.subjectName,
      obtainedMarks: r.mark.obtainedMarks,
      grade: r.mark.grade ?? null,
      minMarks: r.mark.minMarks,
      maxMarks: r.mark.maxMarks,
    })),
    summary: {
      ...summary,
      passPercentage,
      grade: summary.hasPendingMarks ? "—" : summary.passed ? gradeFor(summary.percentage) : "F",
    },
    resultType,
    studentGrade: courseGrade,
  };
}

export async function listAllMarks(query: ListQuery, courseId?: string) {
  type StudentRow = {
    roll_number: string;
    name: string;
    course_id: string;
    grade: string | null;
    courses: { course_name?: string } | null;
  };
  type RawMark = {
    id: string;
    roll_number: string;
    subject_id: string;
    obtained_marks: number | null;
    grade: string | null;
    subjects: { subject_name: string; min_marks: number; max_marks: number; display_order: number; status: string | null; deleted_at: string | null } | null;
  };

  let studentsBuilder = supabase
    .from("students")
    .select("roll_number, name, course_id, grade, courses(course_name)", { count: "exact" })
    .is("deleted_at", null)
    .is("archived_at", null);

  if (courseId) studentsBuilder = studentsBuilder.eq("course_id", courseId);
  if (query.q) {
    const term = query.q.replace(/[%,]/g, " ").trim();
    studentsBuilder = studentsBuilder.or(`name.ilike.%${term}%,roll_number.ilike.%${term}%`);
  }

  const [from, to] = range(query.page, query.pageSize);
  const { data: students, error: studErr, count } = await studentsBuilder
    .order("created_at", { ascending: false })
    .range(from, to);

  if (studErr) throw ApiError.internal(`Failed to list students: ${studErr.message}`);
  if (!students?.length) return buildListResponse([], count ?? 0, query.page, query.pageSize);

  const studs = students as unknown as StudentRow[];
  const rollNumbers = studs.map((s) => s.roll_number);

  const { data: marksData } = await supabase
    .from("student_marks")
    .select("id, roll_number, subject_id, obtained_marks, grade, subjects(subject_name, min_marks, max_marks, display_order, status, deleted_at)")
    .in("roll_number", rollNumbers)
    .is("deleted_at", null);

  const rawMarks = ((marksData ?? []) as unknown as RawMark[]).filter(
    (m) => !!m.subjects && m.subjects.deleted_at == null && (m.subjects.status ?? "active") === "active"
  );
  const passPercentage = await getPassPercentage();

  const marksByRoll = new Map<string, RawMark[]>();
  for (const m of rawMarks) {
    const list = marksByRoll.get(m.roll_number) ?? [];
    list.push(m);
    marksByRoll.set(m.roll_number, list);
  }

  const items = studs.map((s) => {
    const rawList = (marksByRoll.get(s.roll_number) ?? []).sort(
      (a, b) => (a.subjects?.display_order ?? 0) - (b.subjects?.display_order ?? 0)
    );
    const markRows: MarkRow[] = rawList.map((r) => ({
      subjectId: r.subject_id,
      subjectName: r.subjects?.subject_name ?? "",
      obtainedMarks: r.obtained_marks,
      grade: r.grade,
      minMarks: r.subjects?.min_marks ?? 0,
      maxMarks: r.subjects?.max_marks ?? 100,
      displayOrder: r.subjects?.display_order ?? 0,
    }));

    const summary = computeResult(markRows, passPercentage);
    const courseGrade = s.grade;
    const allMarksEntered = markRows.length > 0 && markRows.every((r) => r.obtainedMarks !== null);
    const resultType: "marksheet" | "gradecard" | "pending" = courseGrade != null
      ? "gradecard"
      : allMarksEntered
        ? "marksheet"
        : "pending";

    return {
      rollNumber: s.roll_number,
      studentName: s.name,
      courseId: s.course_id,
      courseName: s.courses?.course_name ?? null,
      grade: courseGrade,
      subjectsCount: markRows.length,
      marksEntered: markRows.filter((r) => r.obtainedMarks !== null).length,
      resultType,
      passed: summary.passed,
      percentage: summary.percentage,
      hasPendingMarks: summary.hasPendingMarks,
      marks: rawList.map((r) => ({
        markId: r.id,
        subjectId: r.subject_id,
        subjectName: r.subjects?.subject_name ?? "",
        obtainedMarks: r.obtained_marks,
        subjectGrade: r.grade,
        minMarks: r.subjects?.min_marks ?? 0,
        maxMarks: r.subjects?.max_marks ?? 100,
      })),
    };
  });

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

export async function clearStudentMarks(rollNumber: string, actorId: string) {
  const { error } = await supabase
    .from("student_marks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("roll_number", rollNumber)
    .is("deleted_at", null);
  if (error) throw ApiError.internal("Failed to clear marks");

  await supabase.from("students").update({ grade: null }).eq("roll_number", rollNumber);

  await writeAudit({
    actorId,
    action: "marks.clear",
    entity: "student_marks",
    entityId: rollNumber,
    newValue: null,
  });
}

export async function bulkUpdateMarksByName(
  entries: { rollNumber: string; subjectName?: string | null; obtainedMarks?: number | null; grade?: string | null; courseGrade?: string | null }[],
  actorId: string
) {
  const courseGradesByRoll = new Map<string, string | null>();
  for (const e of entries) {
    if (e.courseGrade !== undefined) {
      courseGradesByRoll.set(e.rollNumber, e.courseGrade ?? null);
    }
  }
  for (const [rollNumber, grade] of courseGradesByRoll) {
    await setStudentGrade(rollNumber, grade, actorId).catch(() => {});
  }

  const markEntries = entries.filter((e) => e.subjectName?.trim());
  const byRoll = new Map<string, typeof markEntries>();
  for (const e of markEntries) {
    const list = byRoll.get(e.rollNumber) ?? [];
    list.push(e);
    byRoll.set(e.rollNumber, list);
  }

  let ok = 0;
  let fail = 0;
  for (const [rollNumber, rows] of byRoll.entries()) {
    try {
      const { marks } = await getStudentMarks(rollNumber);
      const nameToId = new Map(marks.map((m) => [m.subjectName.toLowerCase(), m.subjectId]));
      const toSave = rows
        .map((r) => {
          const subjectId = nameToId.get(r.subjectName!.toLowerCase().trim());
          return subjectId ? { subjectId, obtainedMarks: r.obtainedMarks ?? null, grade: r.grade } : null;
        })
        .filter((m): m is NonNullable<typeof m> => m !== null);
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
