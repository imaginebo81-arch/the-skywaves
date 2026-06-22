import { useContent } from "../context/ContentContext";
import type { StudentResult } from "../lib/api/types";
import { formatDate } from "../lib/dateUtils";

export default function ResultSheet({ result }: { result: StudentResult }) {
  const { meta } = useContent();
  const { student, marks, summary } = result;

  const resultCls = summary.passed
    ? "bg-green-100 text-green-700 border-green-200"
    : summary.hasPendingMarks
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-red-100 text-red-700 border-red-200";
  const resultLabel = summary.passed ? "PASS" : summary.hasPendingMarks ? "PENDING" : "FAIL";

  return (
    <div className="w-full bg-white shadow-lg overflow-hidden text-left rounded-2xl border border-gray-100 print:shadow-none print:rounded-none print:border-gray-200">
      {/* Header */}
      <div className="bg-[#151b23] text-white px-4 py-4 sm:px-10 sm:py-6 flex flex-wrap items-start sm:items-center gap-2 justify-between">
        <div>
          <h2 className="text-base sm:text-2xl font-black uppercase tracking-wide sm:tracking-widest text-white leading-tight">{meta.orgName}</h2>
          <p className="text-[#eaa320] text-[10px] font-semibold uppercase tracking-[2px] sm:tracking-[3px] mt-0.5 sm:mt-1">Verified Academic Record</p>
        </div>
        <div className="text-right">
          <p className="text-gray-300 text-xs sm:text-sm uppercase tracking-wide sm:tracking-widest font-semibold">Statement of Marks</p>
        </div>
      </div>
      <div className="h-1.5 bg-gradient-to-r from-[#eaa320] to-[#f5c842]" />

      {/* Body */}
      <div className="flex flex-col md:flex-row min-h-[360px]">
        {/* Left panel — 30% */}
        <div className="md:w-[30%] bg-gray-50 px-4 py-5 sm:px-8 sm:py-8 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="flex justify-center">
            {student.profilePhotoUrl ? (
              <img
                src={student.profilePhotoUrl}
                alt={student.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-[#eaa320]/15 flex items-center justify-center text-[#eaa320] text-4xl font-black border-4 border-white shadow-md">
                {student.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <InfoRow label="Name" value={student.name} bold />
            <InfoRow label="Roll No." value={student.rollNumber} mono />
            <InfoRow label="Course" value={student.courseName ?? "—"} clamp />
            {student.fatherName && <InfoRow label="Father" value={student.fatherName} />}
            {student.startDate && <InfoRow label="Start" value={formatDate(student.startDate)} />}
            {student.endDate && <InfoRow label="End" value={formatDate(student.endDate)} />}
          </div>

          <div className="mt-auto">
            <div className={`text-center py-3.5 px-4 rounded-xl font-black text-lg uppercase tracking-[3px] border-2 ${resultCls}`}>
              {resultLabel}
            </div>
          </div>
        </div>

        {/* Right panel — 70% */}
        <div className="md:w-[70%] px-4 py-5 sm:px-8 sm:py-8 flex flex-col gap-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[2px]">Academic Performance</p>

          {summary.hasPendingMarks ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⏳</span>
                </div>
                <p className="text-gray-600 font-semibold text-base">Result Pending</p>
                <p className="text-gray-400 text-sm mt-1.5">Result will be available once all subject marks are entered by the institute.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#151b23] text-white text-left">
                      <th className="px-5 py-3 font-semibold rounded-tl text-[13px]">Subject</th>
                      <th className="px-4 py-3 font-semibold text-center w-24 text-[13px]">Obtained</th>
                      <th className="px-4 py-3 font-semibold text-center w-20 text-[13px]">Min</th>
                      <th className="px-4 py-3 font-semibold text-center w-20 text-[13px] rounded-tr">Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((m, i) => {
                      const failed = m.obtainedMarks != null && m.obtainedMarks < m.minMarks;
                      return (
                        <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} ${failed ? "!bg-red-50" : ""}`}>
                          <td className="px-5 py-3 font-medium text-gray-800 text-[13px]">{m.subjectName}</td>
                          <td className={`px-4 py-3 text-center font-bold text-[13px] ${failed ? "text-red-600" : "text-gray-900"}`}>
                            {m.obtainedMarks != null ? m.obtainedMarks : <span className="text-amber-500">—</span>}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-400 text-[13px]">{m.minMarks}</td>
                          <td className="px-4 py-3 text-center text-gray-400 text-[13px]">{m.maxMarks}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#eaa320]/10 border-t-2 border-[#eaa320] font-bold">
                      <td className="px-5 py-3 text-gray-700 text-[13px]">Total</td>
                      <td className="px-4 py-3 text-center text-gray-900 text-[13px]">{summary.totalObtained}</td>
                      <td className="px-4 py-3 text-center text-gray-400 text-[13px]">—</td>
                      <td className="px-4 py-3 text-center text-gray-900 text-[13px]">{summary.totalMax}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-auto">
                <div className="flex items-baseline gap-2">
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Percentage</span>
                  <span className="text-2xl font-black text-gray-800">{summary.percentage.toFixed(1)}%</span>
                </div>
                <div className={`px-6 py-2 rounded-xl font-black text-base uppercase tracking-[2px] border-2 ${resultCls}`}>
                  {resultLabel}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-10 py-3.5 text-center">
        <p className="text-gray-400 text-[10px] uppercase tracking-widest">
          Computer-Generated Document · {meta.orgName} · Issued via Official Verification Portal
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, bold, mono, clamp }: { label: string; value: string; bold?: boolean; mono?: boolean; clamp?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-dashed border-gray-200 pb-2">
      <span className="text-gray-400 text-xs uppercase tracking-wide shrink-0 mt-0.5">{label}</span>
      <span className={`text-right ${bold ? "font-bold text-gray-900 text-sm" : "font-medium text-gray-700 text-xs"} ${mono ? "font-mono tracking-wide" : ""} ${clamp ? "line-clamp-2" : ""}`}>
        {value}
      </span>
    </div>
  );
}
