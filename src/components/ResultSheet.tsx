import { useContent } from "../context/ContentContext";
import type { StudentResult } from "../lib/api/types";

function formatDate(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ResultSheet({ result }: { result: StudentResult }) {
  const { meta } = useContent();
  const { student, marks, summary } = result;

  return (
    <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-[16px] overflow-hidden text-left">
      <div className="bg-dark text-white px-8 py-6 text-center">
        <h3 className="text-2xl font-bold uppercase tracking-widest">{meta.orgName}</h3>
        <p className="text-gray-300 text-sm uppercase tracking-widest mt-1">Statement of Marks</p>
      </div>

      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-6 text-sm">
          <Field label="Student Name" value={student.name} />
          <Field label="Roll Number" value={student.rollNumber} />
          <Field label="Course" value={student.courseName ?? "-"} />
          <Field label="Father Name" value={student.fatherName ?? "-"} />
          <Field label="Start Date" value={formatDate(student.startDate)} />
          <Field label="End Date" value={formatDate(student.endDate)} />
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-orange-50 text-gray-800">
              <th className="border border-gray-200 px-3 py-2 text-left">Subject</th>
              <th className="border border-gray-200 px-3 py-2 text-center">Obtained</th>
              <th className="border border-gray-200 px-3 py-2 text-center">Min</th>
              <th className="border border-gray-200 px-3 py-2 text-center">Max</th>
            </tr>
          </thead>
          <tbody>
            {marks.map((m, i) => (
              <tr key={i} className={m.obtainedMarks != null && m.obtainedMarks < m.minMarks ? "bg-red-50" : ""}>
                <td className="border border-gray-200 px-3 py-2">{m.subjectName}</td>
                <td className="border border-gray-200 px-3 py-2 text-center font-medium">
                  {m.obtainedMarks ?? "-"}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-center text-gray-500">{m.minMarks}</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-gray-500">{m.maxMarks}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-gray-50">
              <td className="border border-gray-200 px-3 py-2 text-right">Total</td>
              <td className="border border-gray-200 px-3 py-2 text-center">{summary.totalObtained}</td>
              <td className="border border-gray-200 px-3 py-2 text-center">-</td>
              <td className="border border-gray-200 px-3 py-2 text-center">{summary.totalMax}</td>
            </tr>
          </tfoot>
        </table>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <Summary label="Total" value={`${summary.totalObtained} / ${summary.totalMax}`} />
          <Summary label="Percentage" value={`${summary.percentage}%`} />
          <Summary label="Grade" value={summary.grade} />
          <div className={`rounded-lg p-3 text-center ${summary.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            <p className="text-xs uppercase tracking-wide">Result</p>
            <p className="text-lg font-bold">{summary.passed ? "PASS" : "FAIL"}</p>
          </div>
        </div>

        {summary.hasPendingMarks && (
          <p className="text-amber-600 text-xs mt-4">Note: marks for some subjects are not yet entered.</p>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-dashed border-gray-200 pb-1">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-3 text-center bg-orange-50">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
