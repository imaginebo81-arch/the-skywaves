import { useContent } from "../context/ContentContext";
import type { StudentResult } from "../lib/api/types";
import { formatDate } from "../lib/dateUtils";

const GRADE_INFO: Record<string, { label: string; color: string; bg: string; border: string }> = {
  "A+": { label: "Outstanding",  color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  "A":  { label: "Excellent",    color: "text-green-700",   bg: "bg-green-50",   border: "border-green-200" },
  "B+": { label: "Very Good",    color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200" },
  "B":  { label: "Good",         color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
  "C":  { label: "Average",      color: "text-yellow-700",  bg: "bg-yellow-50",  border: "border-yellow-200" },
  "D":  { label: "Satisfactory", color: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-200" },
  "F":  { label: "Fail",         color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200" },
};

export default function GradeCard({ result }: { result: StudentResult }) {
  const { meta } = useContent();
  const { student, studentGrade } = result;
  const grade = studentGrade ?? "—";
  const info = GRADE_INFO[grade];
  const isFail = grade === "F";

  return (
    <div className="w-full bg-white shadow-lg overflow-hidden text-left rounded-2xl border border-gray-100 print:shadow-none print:rounded-none print:border-gray-200">
      {/* Header */}
      <div className="bg-[#151b23] text-white px-10 py-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-white leading-tight">{meta.orgName}</h2>
          <p className="text-[#eaa320] text-[11px] font-semibold uppercase tracking-[3px] mt-1">Verified Academic Record</p>
        </div>
        <div className="text-right">
          <p className="text-gray-300 text-sm uppercase tracking-widest font-semibold">Grade Card</p>
        </div>
      </div>
      <div className="h-1.5 bg-gradient-to-r from-[#eaa320] to-[#f5c842]" />

      {/* Body */}
      <div className="flex flex-col md:flex-row min-h-[360px]">
        {/* Left panel — 30% */}
        <div className="md:w-[30%] bg-gray-50 px-8 py-8 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-gray-200">
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
            <div className={`text-center py-3.5 px-4 rounded-xl font-black text-lg uppercase tracking-[3px] border-2 ${isFail ? "bg-red-100 text-red-700 border-red-200" : "bg-green-100 text-green-700 border-green-200"}`}>
              {isFail ? "FAIL" : "PASS"}
            </div>
          </div>
        </div>

        {/* Right panel — 70% */}
        <div className="md:w-[70%] px-8 py-8 flex flex-col gap-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[2px]">Course Grade</p>

          {/* Grade display */}
          <div className={`flex-1 flex flex-col items-center justify-center rounded-2xl border-2 py-10 px-8 ${info?.bg ?? "bg-gray-50"} ${info?.border ?? "border-gray-200"}`}>
            <div
              className={`text-[100px] leading-none font-black select-none ${info?.color ?? "text-gray-600"}`}
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              {grade}
            </div>
            {info && (
              <div className={`mt-4 text-base font-bold uppercase tracking-[3px] ${info.color}`}>
                {info.label}
              </div>
            )}
          </div>

          {/* Course + period row */}
          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Programme</p>
              <p className="font-semibold text-gray-800 text-sm line-clamp-2">{student.courseName ?? "—"}</p>
            </div>
            {student.startDate && student.endDate && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Academic Period</p>
                <p className="font-semibold text-gray-800 text-sm">{formatDate(student.startDate)} – {formatDate(student.endDate)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-10 py-3.5 text-center">
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
