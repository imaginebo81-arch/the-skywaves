export interface MarkRow {
  subjectId: string;
  subjectName: string;
  obtainedMarks: number | null;
  minMarks: number;
  maxMarks: number;
  displayOrder: number;
}

export interface ResultSummary {
  totalObtained: number;
  totalMax: number;
  percentage: number;
  passed: boolean;
  failedSubjects: string[];
  hasPendingMarks: boolean;
}

export function computeResult(
  marks: MarkRow[],
  passPercentage: number
): ResultSummary {
  let totalObtained = 0;
  let totalMax = 0;
  const failedSubjects: string[] = [];
  let hasPendingMarks = false;

  for (const m of marks) {
    totalMax += m.maxMarks;
    if (m.obtainedMarks == null) {
      hasPendingMarks = true;
      failedSubjects.push(m.subjectName);
      continue;
    }
    totalObtained += m.obtainedMarks;
    if (m.obtainedMarks < m.minMarks) {
      failedSubjects.push(m.subjectName);
    }
  }

  const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 10000) / 100 : 0;
  const passed =
    !hasPendingMarks && failedSubjects.length === 0 && percentage >= passPercentage;

  return {
    totalObtained,
    totalMax,
    percentage,
    passed,
    failedSubjects,
    hasPendingMarks,
  };
}

export function gradeFor(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 35) return "D";
  return "F";
}
