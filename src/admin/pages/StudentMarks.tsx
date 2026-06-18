import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { Plus, Pencil, Trash2, Search, Download, Upload, FileSpreadsheet, ExternalLink, Save, Loader2, X } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { adminApi } from "../../lib/api/admin";
import { PageHeader, Spinner, ErrorBanner, Button, Modal, ConfirmDialog, Field, inputClass } from "../components/ui";
import { downloadCsv, parseUploadedFile } from "../../lib/csv";

interface SubjectMark {
  markId: string;
  subjectId: string;
  subjectName: string;
  obtainedMarks: number | null;
  subjectGrade: string | null;
  minMarks: number;
  maxMarks: number;
}

interface StudentEntry {
  rollNumber: string;
  studentName: string;
  courseId: string;
  courseName: string | null;
  grade: string | null;
  subjectsCount: number;
  marksEntered: number;
  resultType: "marksheet" | "gradecard" | "pending";
  passed: boolean;
  percentage: number;
  hasPendingMarks: boolean;
  marks: SubjectMark[];
}

interface EditState {
  rollNumber: string;
  studentName: string;
  courseGrade: string;
  rows: { markId: string; subjectName: string; obtainedMarks: number | null; minMarks: number; maxMarks: number }[];
}

const RESULT_BADGE: Record<string, { label: string; cls: string }> = {
  marksheet: { label: "Marksheet", cls: "bg-blue-100 text-blue-700" },
  gradecard: { label: "Grade Card", cls: "bg-purple-100 text-purple-700" },
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
};

export default function StudentMarks() {
  const [q, setQ] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, loading, error, reload } = useApi(
    () => adminApi.listAllMarks({ q: q || undefined, courseId: courseFilter || undefined, pageSize: 200 } as Record<string, string | number | boolean | undefined>),
    [q, courseFilter]
  );

  const { data: coursesData } = useApi(() => adminApi.list<{ id: string; courseName: string }>("courses", { pageSize: 100 }), []);

  const [confirmClear, setConfirmClear] = useState<StudentEntry | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [edit, setEdit] = useState<EditState | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [newForm, setNewForm] = useState<{ rollNumber: string; courseGrade: string; subjectName: string; obtainedMarks: string } | null>(null);
  const [newSaving, setNewSaving] = useState(false);
  const [newError, setNewError] = useState<string | null>(null);

  const items: StudentEntry[] = (data as unknown as { items?: StudentEntry[] } | null)?.items ?? [];
  const courses = coursesData?.items ?? [];

  const handleDownload = () => {
    const rows: string[][] = [];
    for (const s of items) {
      if (s.marks.length === 0) {
        rows.push([s.rollNumber, s.studentName, s.courseName ?? "", "", "", "", s.grade ?? ""]);
      } else {
        for (const m of s.marks) {
          rows.push([s.rollNumber, s.studentName, s.courseName ?? "", m.subjectName, m.minMarks.toString(), m.maxMarks.toString(), m.obtainedMarks?.toString() ?? "", s.grade ?? ""]);
        }
      }
    }
    downloadCsv("student_marks.csv",
      ["rollNumber", "studentName", "courseName", "subjectName", "minMarks", "maxMarks", "obtainedMarks", "courseGrade"],
      rows
    );
  };

  const handleSample = () => {
    downloadCsv("student_marks_sample.csv",
      ["rollNumber", "subjectName", "obtainedMarks", "courseGrade"],
      [
        ["SR00000001", "Mathematics", "85", ""],
        ["SR00000001", "Science", "72", ""],
        ["SR00000002", "", "", "A+"],
      ]
    );
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    setUploadMsg(null);
    try {
      const rows = await parseUploadedFile(file);
      const entries = rows
        .filter((r) => r["rollNumber"]?.trim())
        .map((r) => ({
          rollNumber: r["rollNumber"].trim(),
          subjectName: r["subjectName"]?.trim() || null,
          obtainedMarks: r["obtainedMarks"] !== "" && r["obtainedMarks"] != null ? Number(r["obtainedMarks"]) : null,
          grade: r["grade"]?.trim() || null,
          courseGrade: r["courseGrade"]?.trim() || undefined,
        }));
      if (entries.length === 0) { setUploadMsg("No valid rows found"); setUploading(false); return; }
      const res = await adminApi.bulkUpdateMarks(entries);
      setUploadMsg(`${res.ok} updated, ${res.fail} failed`);
      reload();
    } catch {
      setUploadMsg("Failed to parse or upload file");
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (s: StudentEntry) => {
    setEdit({
      rollNumber: s.rollNumber,
      studentName: s.studentName,
      courseGrade: s.grade ?? "",
      rows: s.marks.map((m) => ({
        markId: m.markId,
        subjectName: m.subjectName,
        obtainedMarks: m.obtainedMarks,
        minMarks: m.minMarks,
        maxMarks: m.maxMarks,
      })),
    });
    setEditError(null);
  };

  const saveEdit = async () => {
    if (!edit) return;
    setEditSaving(true);
    setEditError(null);
    try {
      const ops: Promise<unknown>[] = [];
      ops.push(adminApi.setStudentGrade(edit.rollNumber, edit.courseGrade.trim() || null));
      const markEntries = edit.rows
        .filter((r) => r.subjectName)
        .map((r) => ({ rollNumber: edit.rollNumber, subjectName: r.subjectName, obtainedMarks: r.obtainedMarks }));
      if (markEntries.length > 0) ops.push(adminApi.bulkUpdateMarks(markEntries));
      await Promise.all(ops);
      setEdit(null);
      reload();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setEditSaving(false);
    }
  };

  const openPreview = async (rollNumber: string) => {
    const { token } = await adminApi.getResultToken(rollNumber);
    window.open(`/verification/result/${encodeURIComponent(rollNumber)}?token=${token}`, "_blank");
  };

  const confirmAndClear = async () => {
    if (!confirmClear) return;
    await adminApi.clearStudentMarks(confirmClear.rollNumber).catch(() => {});
    setConfirmClear(null);
    reload();
  };

  const saveNew = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!newForm) return;
    setNewSaving(true);
    setNewError(null);
    try {
      const rollNumber = newForm.rollNumber.trim();
      if (!rollNumber) throw new Error("Roll number is required");
      const ops: Promise<unknown>[] = [];
      if (newForm.courseGrade.trim()) {
        ops.push(adminApi.setStudentGrade(rollNumber, newForm.courseGrade.trim()));
      }
      if (newForm.subjectName.trim()) {
        ops.push(adminApi.bulkUpdateMarks([{
          rollNumber,
          subjectName: newForm.subjectName.trim(),
          obtainedMarks: newForm.obtainedMarks !== "" ? Number(newForm.obtainedMarks) : null,
        }]));
      }
      if (ops.length === 0) throw new Error("Enter a course grade or subject name");
      await Promise.all(ops);
      setNewForm(null);
      reload();
    } catch (err) {
      setNewError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setNewSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Student Marks"
        subtitle="All enrolled students · marks, grades and results"
        actions={<Button onClick={() => setNewForm({ rollNumber: "", courseGrade: "", subjectName: "", obtainedMarks: "" })}><Plus size={16} /> New Entry</Button>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <form onSubmit={(e) => { e.preventDefault(); setQ(searchInput); }} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input className={`${inputClass} pl-10 w-64`} placeholder="Search roll no. or name" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        </form>
        <select className={`${inputClass} w-52`} value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); }}>
          <option value="">All Courses</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.courseName}</option>)}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button variant="secondary" onClick={handleDownload}><Download size={15} /> Download CSV</Button>
        <Button variant="secondary" onClick={handleSample}><FileSpreadsheet size={15} /> Sample CSV</Button>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload size={15} /> {uploading ? "Uploading..." : "Upload CSV/XLSX"}
        </Button>
        <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleUpload} />
        {uploadMsg && <span className="text-sm text-gray-600">{uploadMsg}</span>}
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorBanner message={error} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Roll No.</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold text-center">Subjects</th>
                <th className="px-4 py-3 font-semibold text-center">Grade</th>
                <th className="px-4 py-3 font-semibold text-center">%</th>
                <th className="px-4 py-3 font-semibold text-center">Result</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((s) => {
                const badge = RESULT_BADGE[s.resultType];
                const statusCls = s.resultType === "pending"
                  ? "bg-amber-100 text-amber-700"
                  : s.passed
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700";
                const statusLabel = s.resultType === "pending" ? "Pending" : s.passed ? "Pass" : "Fail";
                return (
                  <tr key={s.rollNumber} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{s.rollNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{s.studentName}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.courseName ?? "-"}</td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {s.subjectsCount === 0 ? (
                        <span className="text-gray-400 text-xs">—</span>
                      ) : (
                        <span>{s.marksEntered}/{s.subjectsCount}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.grade ? (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">{s.grade}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {s.resultType === "marksheet" ? `${s.percentage}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCls}`}>{statusLabel}</span>
                      {s.resultType !== "pending" && (
                        <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-medium ${badge.cls}`}>{badge.label}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" title="Edit marks & grade" onClick={() => openEdit(s)}><Pencil size={15} /></Button>
                        <Button variant="ghost" title="Preview result" onClick={() => void openPreview(s.rollNumber)}><ExternalLink size={15} /></Button>
                        <Button variant="ghost" title="Clear all marks & grade" onClick={() => setConfirmClear(s)}><Trash2 size={15} className="text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={edit !== null} onClose={() => setEdit(null)} title={`Edit — ${edit?.studentName ?? ""} (${edit?.rollNumber ?? ""})`} wide>
        {edit && (
          <>
            <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Course Grade <span className="text-gray-400 font-normal">(for grade card result)</span></label>
              <input
                type="text" maxLength={3} placeholder="e.g. A+"
                className={`${inputClass} w-40 uppercase font-bold tracking-wider`}
                value={edit.courseGrade}
                onChange={(e) => setEdit({ ...edit, courseGrade: e.target.value.toUpperCase() })}
              />
              <p className="text-xs text-gray-400 mt-1">Leave blank if student has subject marks instead.</p>
            </div>

            {edit.rows.length > 0 ? (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Subject Marks</p>
                <table className="w-full text-sm mb-4">
                  <thead className="text-gray-500 text-left">
                    <tr>
                      <th className="py-2 font-semibold">Subject</th>
                      <th className="py-2 text-center font-semibold">Min</th>
                      <th className="py-2 text-center font-semibold">Max</th>
                      <th className="py-2 text-center font-semibold">Obtained</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {edit.rows.map((r, i) => (
                      <tr key={r.subjectName}>
                        <td className="py-2 font-medium text-gray-900">{r.subjectName}</td>
                        <td className="py-2 text-center text-gray-500">{r.minMarks}</td>
                        <td className="py-2 text-center text-gray-500">{r.maxMarks}</td>
                        <td className="py-2 text-center">
                          <input
                            type="number" min={0} max={r.maxMarks}
                            className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-center outline-none focus:border-[#eaa320]"
                            value={r.obtainedMarks ?? ""}
                            onChange={(e) => setEdit((prev) => prev ? {
                              ...prev,
                              rows: prev.rows.map((row, idx) => idx === i
                                ? { ...row, obtainedMarks: e.target.value === "" ? null : Number(e.target.value) }
                                : row)
                            } : null)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="text-sm text-gray-400 mb-4 italic">No subjects assigned to this student's course. Use Course Grade above.</p>
            )}

            {editError && <ErrorBanner message={editError} />}
            <div className="flex justify-end gap-3 mt-2">
              <Button variant="secondary" onClick={() => setEdit(null)}><X size={15} /> Cancel</Button>
              <Button onClick={saveEdit} disabled={editSaving}>
                {editSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {editSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* New Entry Modal */}
      <Modal open={newForm !== null} onClose={() => setNewForm(null)} title="New Mark Entry">
        {newForm && (
          <form onSubmit={saveNew} className="flex flex-col gap-4">
            <Field label="Roll Number *">
              <input required className={inputClass} placeholder="e.g. SR00000001" value={newForm.rollNumber} onChange={(e) => setNewForm({ ...newForm, rollNumber: e.target.value })} />
            </Field>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 mb-3 font-medium">Fill Course Grade for a grade-card result, OR Subject + Marks for a marksheet result.</p>
              <Field label="Course Grade (optional)">
                <input type="text" maxLength={3} placeholder="e.g. A+" className={`${inputClass} uppercase`} value={newForm.courseGrade} onChange={(e) => setNewForm({ ...newForm, courseGrade: e.target.value.toUpperCase() })} />
              </Field>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <Field label="Subject Name (optional)">
                <input className={inputClass} placeholder="e.g. Mathematics" value={newForm.subjectName} onChange={(e) => setNewForm({ ...newForm, subjectName: e.target.value })} />
              </Field>
              <div className="mt-3">
                <Field label="Obtained Marks (optional)">
                  <input type="number" min={0} className={inputClass} placeholder="e.g. 85" value={newForm.obtainedMarks} onChange={(e) => setNewForm({ ...newForm, obtainedMarks: e.target.value })} />
                </Field>
              </div>
            </div>
            {newError && <ErrorBanner message={newError} />}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setNewForm(null)}>Cancel</Button>
              <Button type="submit" disabled={newSaving}>{newSaving ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmClear !== null}
        title="Clear All Marks"
        message={`This will permanently clear all marks and the course grade for ${confirmClear?.studentName ?? ""} (${confirmClear?.rollNumber ?? ""}). The student will show as Pending.`}
        confirmLabel="Clear All"
        destructive
        onConfirm={confirmAndClear}
        onCancel={() => setConfirmClear(null)}
      />
    </div>
  );
}
