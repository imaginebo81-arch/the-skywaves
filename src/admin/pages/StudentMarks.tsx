import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { Plus, Pencil, Trash2, Search, Download, Upload, FileSpreadsheet, ExternalLink, Save, Loader2, X } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { adminApi } from "../../lib/api/admin";
import { PageHeader, Spinner, ErrorBanner, Button, Modal, ConfirmDialog, Field, inputClass } from "../components/ui";
import { downloadCsv, parseUploadedFile } from "../../lib/csv";

interface MarkEntry {
  markId: string;
  rollNumber: string;
  studentName: string;
  courseId: string;
  courseName: string | null;
  subjectName: string;
  minMarks: number;
  maxMarks: number;
  obtainedMarks: number | null;
}

interface EditRow {
  markId: string;
  subjectId: string;
  subjectName: string;
  obtainedMarks: number | null;
  minMarks: number;
  maxMarks: number;
}

export default function StudentMarks() {
  const [q, setQ] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, loading, error, reload } = useApi(
    () => adminApi.listAllMarks({ q: q || undefined, courseId: courseFilter || undefined, pageSize: 200 } as Record<string, string | number | boolean | undefined>),
    [q, courseFilter]
  );

  const { data: coursesData } = useApi(() => adminApi.list<{ id: string; courseName: string }>("courses", { pageSize: 100 }), []);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<MarkEntry | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editRoll, setEditRoll] = useState<string | null>(null);
  const [editRows, setEditRows] = useState<EditRow[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [newForm, setNewForm] = useState<{ rollNumber: string; subjectName: string; obtainedMarks: string } | null>(null);
  const [newSaving, setNewSaving] = useState(false);
  const [newError, setNewError] = useState<string | null>(null);

  const items: MarkEntry[] = (data as { items?: MarkEntry[] } | null)?.items ?? [];
  const courses = coursesData?.items ?? [];

  const filtered = q
    ? items.filter(m =>
        m.rollNumber.toLowerCase().includes(q.toLowerCase()) ||
        m.studentName.toLowerCase().includes(q.toLowerCase())
      )
    : items;

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const toggleAll = () => setSelected(selected.size === filtered.length && filtered.length > 0 ? new Set() : new Set(filtered.map(m => m.markId)));

  const bulkDelete = async () => {
    await Promise.allSettled([...selected].map(id => adminApi.deleteMark(id)));
    setSelected(new Set());
    setConfirmBulkDelete(false);
    reload();
  };

  const deleteSingle = async () => {
    if (!confirmDelete) return;
    await adminApi.deleteMark(confirmDelete.markId);
    setConfirmDelete(null);
    reload();
  };

  const handleDownload = () => {
    downloadCsv("student_marks.csv",
      ["rollNumber", "studentName", "courseName", "subjectName", "minMarks", "maxMarks", "obtainedMarks"],
      items.map(m => [m.rollNumber, m.studentName, m.courseName ?? "", m.subjectName, m.minMarks, m.maxMarks, m.obtainedMarks ?? ""])
    );
  };

  const handleSample = () => {
    downloadCsv("student_marks_sample.csv",
      ["rollNumber", "subjectName", "obtainedMarks"],
      [["SR00000001", "Mathematics", "85"], ["SR00000001", "Science", "90"]]
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
        .filter(r => r["rollNumber"]?.trim() && r["subjectName"]?.trim())
        .map(r => ({
          rollNumber: r["rollNumber"].trim(),
          subjectName: r["subjectName"].trim(),
          obtainedMarks: r["obtainedMarks"] !== "" && r["obtainedMarks"] != null ? Number(r["obtainedMarks"]) : null,
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

  const openEdit = (rollNumber: string) => {
    const rows = items.filter(m => m.rollNumber === rollNumber);
    setEditRows(rows.map(m => ({ markId: m.markId, subjectId: "", subjectName: m.subjectName, obtainedMarks: m.obtainedMarks, minMarks: m.minMarks, maxMarks: m.maxMarks })));
    setEditRoll(rollNumber);
    setEditError(null);
  };

  const saveEdit = async () => {
    if (!editRoll) return;
    setEditSaving(true);
    setEditError(null);
    try {
      const entries = editRows.map(r => ({ rollNumber: editRoll, subjectName: r.subjectName, obtainedMarks: r.obtainedMarks }));
      await adminApi.bulkUpdateMarks(entries);
      setEditRoll(null);
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

  const saveNew = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!newForm) return;
    setNewSaving(true);
    setNewError(null);
    try {
      await adminApi.bulkUpdateMarks([{
        rollNumber: newForm.rollNumber.trim(),
        subjectName: newForm.subjectName.trim(),
        obtainedMarks: newForm.obtainedMarks !== "" ? Number(newForm.obtainedMarks) : null,
      }]);
      setNewForm(null);
      reload();
    } catch (err) {
      setNewError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setNewSaving(false);
    }
  };

  const passOrFail = (m: MarkEntry) => {
    if (m.obtainedMarks == null) return null;
    return m.obtainedMarks >= m.minMarks ? "Pass" : "Fail";
  };

  return (
    <div>
      <PageHeader
        title="Student Marks"
        subtitle="View and manage all student marks"
        actions={<Button onClick={() => setNewForm({ rollNumber: "", subjectName: "", obtainedMarks: "" })}><Plus size={16} /> New Entry</Button>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <form onSubmit={(e) => { e.preventDefault(); setQ(searchInput); }} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input className={`${inputClass} pl-10 w-64`} placeholder="Search roll number or name" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        </form>
        <select className={`${inputClass} w-52`} value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setSelected(new Set()); }}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.courseName}</option>)}
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
        {selected.size > 0 && (
          <Button variant="danger" onClick={() => setConfirmBulkDelete(true)}>
            <Trash2 size={15} /> Delete Selected ({selected.size})
          </Button>
        )}
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
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="cursor-pointer accent-[#eaa320]" />
                </th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Roll No.</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Student Name</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold text-center">Min</th>
                <th className="px-4 py-3 font-semibold text-center">Max</th>
                <th className="px-4 py-3 font-semibold text-center">Obtained</th>
                <th className="px-4 py-3 font-semibold text-center">Result</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((m) => {
                const pf = passOrFail(m);
                return (
                  <tr key={m.markId} className={selected.has(m.markId) ? "bg-orange-50" : ""}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(m.markId)} onChange={() => toggleSelect(m.markId)} className="cursor-pointer accent-[#eaa320]" />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{m.rollNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{m.studentName}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{m.courseName ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{m.subjectName}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{m.minMarks}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{m.maxMarks}</td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">{m.obtainedMarks ?? "-"}</td>
                    <td className="px-4 py-3 text-center">
                      {pf === "Pass" && <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">Pass</span>}
                      {pf === "Fail" && <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">Fail</span>}
                      {pf === null && <span className="text-gray-400 text-xs">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" onClick={() => openEdit(m.rollNumber)}><Pencil size={15} /></Button>
                        <Button variant="ghost" onClick={() => openPreview(m.rollNumber)}><ExternalLink size={15} /></Button>
                        <Button variant="ghost" onClick={() => setConfirmDelete(m)}><Trash2 size={15} className="text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-400">No marks found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={editRoll !== null} onClose={() => setEditRoll(null)} title={`Edit Marks — ${editRoll}`} wide>
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
            {editRows.map((r, i) => (
              <tr key={r.subjectName}>
                <td className="py-2 font-medium text-gray-900">{r.subjectName}</td>
                <td className="py-2 text-center text-gray-500">{r.minMarks}</td>
                <td className="py-2 text-center text-gray-500">{r.maxMarks}</td>
                <td className="py-2 text-center">
                  <input
                    type="number" min={0} max={r.maxMarks}
                    className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-center outline-none focus:border-[#eaa320]"
                    value={r.obtainedMarks ?? ""}
                    onChange={(e) => setEditRows(prev => prev.map((row, idx) => idx === i ? { ...row, obtainedMarks: e.target.value === "" ? null : Number(e.target.value) } : row))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {editError && <ErrorBanner message={editError} />}
        <div className="flex justify-end gap-3 mt-2">
          <Button variant="secondary" onClick={() => setEditRoll(null)}><X size={15} /> Cancel</Button>
          <Button onClick={saveEdit} disabled={editSaving}>
            {editSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {editSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </Modal>

      <Modal open={newForm !== null} onClose={() => setNewForm(null)} title="New Mark Entry">
        {newForm && (
          <form onSubmit={saveNew} className="flex flex-col gap-4">
            <Field label="Roll Number">
              <input required className={inputClass} value={newForm.rollNumber} onChange={(e) => setNewForm({ ...newForm, rollNumber: e.target.value })} />
            </Field>
            <Field label="Subject Name">
              <input required className={inputClass} value={newForm.subjectName} onChange={(e) => setNewForm({ ...newForm, subjectName: e.target.value })} />
            </Field>
            <Field label="Obtained Marks">
              <input type="number" min={0} className={inputClass} value={newForm.obtainedMarks} onChange={(e) => setNewForm({ ...newForm, obtainedMarks: e.target.value })} />
            </Field>
            {newError && <ErrorBanner message={newError} />}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setNewForm(null)}>Cancel</Button>
              <Button type="submit" disabled={newSaving}>{newSaving ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete Mark"
        message={`Delete the mark for ${confirmDelete?.subjectName} (${confirmDelete?.rollNumber})?`}
        confirmLabel="Delete"
        destructive
        onConfirm={deleteSingle}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Delete ${selected.size} Mark${selected.size !== 1 ? "s" : ""}`}
        message="This will permanently delete all selected mark rows."
        confirmLabel="Delete All"
        destructive
        onConfirm={bulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </div>
  );
}
