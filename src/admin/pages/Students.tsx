import { useEffect, useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { Plus, Pencil, Archive, Trash2, RotateCcw, Search, Download, Upload, FileSpreadsheet } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { adminApi } from "../../lib/api/admin";
import { PageHeader, Spinner, ErrorBanner, Button, Modal, ConfirmDialog, Field, inputClass, StatusBadge, PhotoAvatar } from "../components/ui";
import { downloadCsv, parseUploadedFile } from "../../lib/csv";
import { formatDate } from "../../lib/dateUtils";

interface Course { id: string; courseName: string; }
interface Student {
  rollNumber: string;
  admissionNumber: string | null;
  name: string;
  fatherName: string | null;
  motherName: string | null;
  dateOfBirth: string;
  address: string | null;
  contactNumber: string | null;
  courseId: string;
  courseName: string | null;
  profilePhotoUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  deletedAt: string | null;
  archivedAt: string | null;
}

const EMPTY = {
  rollNumber: "", name: "", fatherName: "", motherName: "", dateOfBirth: "",
  address: "", contactNumber: "", courseId: "", startDate: "", endDate: "", status: "active",
};

export default function Students() {
  const [q, setQ] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const { data, loading, error, reload } = useApi(
    () => adminApi.list<Student>("students", { q: q || undefined, includeArchived, pageSize: 100 }),
    [includeArchived]
  );

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [profilePhotoPath, setProfilePhotoPath] = useState<string | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ action: "archive" | "delete" | "restore"; student: Student } | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminApi.list<Course>("courses", { pageSize: 100 }).then((res) => setCourses(res.items)).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, courseId: courses[0]?.id ?? "" });
    setProfilePhotoPath(null);
    setProfilePhotoPreview(null);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({
      rollNumber: s.rollNumber, name: s.name, fatherName: s.fatherName ?? "", motherName: s.motherName ?? "",
      dateOfBirth: s.dateOfBirth, address: s.address ?? "", contactNumber: s.contactNumber ?? "",
      courseId: s.courseId, startDate: s.startDate ?? "", endDate: s.endDate ?? "", status: s.status,
    });
    setProfilePhotoPath(s.profilePhotoUrl ? null : null);
    setProfilePhotoPreview(s.profilePhotoUrl ?? null);
    setFormError(null);
    setShowForm(true);
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setPhotoUploading(true);
    try {
      const res = await adminApi.uploadStudentPhoto(file);
      setProfilePhotoPath(res.path);
      setProfilePhotoPreview(res.url ?? null);
    } catch {
      setFormError("Photo upload failed");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    const payload: Record<string, unknown> = {
      name: form.name, fatherName: form.fatherName || null, motherName: form.motherName || null,
      dateOfBirth: form.dateOfBirth, address: form.address || null, contactNumber: form.contactNumber || null,
      courseId: form.courseId, startDate: form.startDate || null, endDate: form.endDate || null, status: form.status,
    };
    if (profilePhotoPath) payload.profilePhotoPath = profilePhotoPath;
    try {
      if (editing) await adminApi.update("students", editing.rollNumber, { rollNumber: form.rollNumber, ...payload });
      else await adminApi.create("students", { rollNumber: form.rollNumber, ...payload });
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save student");
    } finally {
      setSaving(false);
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    const { action, student } = confirm;
    if (action === "archive") await adminApi.archive("students", student.rollNumber);
    else if (action === "delete") await adminApi.remove("students", student.rollNumber);
    else await adminApi.restore("students", student.rollNumber);
    setConfirm(null);
    reload();
  };

  const items = data?.items ?? [];

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const toggleAll = () => setSelected(selected.size === items.length && items.length > 0 ? new Set() : new Set(items.map(s => s.rollNumber)));

  const bulkDelete = async () => {
    await Promise.allSettled([...selected].map(id => adminApi.remove("students", id)));
    setSelected(new Set());
    setConfirmBulkDelete(false);
    reload();
  };

  const handleDownload = () => {
    downloadCsv("students.csv",
      ["rollNumber", "name", "fatherName", "motherName", "dateOfBirth", "contactNumber", "address", "courseName", "startDate", "endDate", "status"],
      items.map(s => [s.rollNumber, s.name, s.fatherName ?? "", s.motherName ?? "", s.dateOfBirth, s.contactNumber ?? "", s.address ?? "", s.courseName ?? "", s.startDate ?? "", s.endDate ?? "", s.status])
    );
  };

  const handleSample = () => {
    downloadCsv("students_sample.csv",
      ["rollNumber", "name", "fatherName", "motherName", "dateOfBirth", "contactNumber", "address", "courseName", "startDate", "endDate", "status"],
      [["SQ00000001", "Rahul Sharma", "Rajesh Sharma", "Sunita Sharma", "2000-05-15", "9876543210", "123 Main St, Delhi", "Computer Applications", "2024-01-01", "2024-06-30", "active"]]
    );
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    setUploadMsg(null);
    const courseByName = new Map(courses.map(c => [c.courseName.toLowerCase(), c.id]));
    try {
      const rows = await parseUploadedFile(file);
      const results = await Promise.allSettled(
        rows.filter(r => r["rollNumber"]?.trim() && r["name"]?.trim()).map(r => {
          const courseId = courseByName.get((r["courseName"] ?? "").toLowerCase().trim()) ?? courses[0]?.id ?? "";
          return adminApi.create("students", {
            rollNumber: r["rollNumber"].trim(),
            name: r["name"].trim(),
            fatherName: r["fatherName"] || null,
            motherName: r["motherName"] || null,
            dateOfBirth: r["dateOfBirth"],
            contactNumber: r["contactNumber"] || null,
            address: r["address"] || null,
            courseId,
            startDate: r["startDate"] || null,
            endDate: r["endDate"] || null,
            status: r["status"] || "active",
          });
        })
      );
      const ok = results.filter(r => r.status === "fulfilled").length;
      const fail = results.filter(r => r.status === "rejected").length;
      setUploadMsg(fail > 0 ? `${ok} imported, ${fail} failed` : `${ok} students imported`);
      reload();
    } catch {
      setUploadMsg("Failed to parse file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="Manage enrolled students"
        actions={
          <>
            <Button variant="secondary" onClick={() => setIncludeArchived((v) => !v)}>{includeArchived ? "Hide Archived" : "Show Archived"}</Button>
            <Button onClick={openCreate}><Plus size={16} /> New Student</Button>
          </>
        }
      />

      <form onSubmit={(e) => { e.preventDefault(); reload(); }} className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input className={`${inputClass} pl-10`} placeholder="Search by name, roll or admission number" value={q} onChange={(e) => setQ(e.target.value)} />
      </form>

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
                  <input type="checkbox" checked={selected.size === items.length && items.length > 0} onChange={toggleAll} className="cursor-pointer accent-[#eaa320]" />
                </th>
                <th className="px-4 py-3 font-semibold w-12">Photo</th>
                <th className="px-4 py-3 font-semibold">Roll No.</th>
                <th className="px-4 py-3 font-semibold">Adm. No.</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Father Name</th>
                <th className="px-4 py-3 font-semibold">Mother Name</th>
                <th className="px-4 py-3 font-semibold">Date of Birth</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((s) => (
                <tr key={s.rollNumber} className={`${s.deletedAt || s.archivedAt ? "opacity-60" : ""} ${selected.has(s.rollNumber) ? "bg-orange-50" : ""}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(s.rollNumber)} onChange={() => toggleSelect(s.rollNumber)} className="cursor-pointer accent-[#eaa320]" />
                  </td>
                  <td className="px-4 py-3">
                    <PhotoAvatar src={s.profilePhotoUrl} name={s.name} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{s.rollNumber}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{s.admissionNumber ?? "-"}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.fatherName ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.motherName ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(s.dateOfBirth)}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.courseName ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.contactNumber ?? "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={s.deletedAt ? "deleted" : s.archivedAt ? "inactive" : s.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {s.deletedAt ? (
                        <>
                          <Button variant="ghost" onClick={() => setConfirm({ action: "restore", student: s })}><RotateCcw size={16} /></Button>
                          <Button variant="ghost" onClick={() => setConfirm({ action: "delete", student: s })}><Trash2 size={16} className="text-red-500" /></Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" onClick={() => openEdit(s)}><Pencil size={16} /></Button>
                          <Button variant="ghost" onClick={() => setConfirm({ action: "archive", student: s })}><Archive size={16} /></Button>
                          <Button variant="ghost" onClick={() => setConfirm({ action: "delete", student: s })}><Trash2 size={16} className="text-red-500" /></Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={12} className="px-4 py-10 text-center text-gray-400">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Student" : "New Student"} wide>
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Roll Number">
            <input required className={`${inputClass} uppercase`} value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
          </Field>
          <Field label="Name">
            <input required className={`${inputClass} uppercase`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Father Name"><input className={`${inputClass} uppercase`} value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} /></Field>
          <Field label="Mother Name"><input className={`${inputClass} uppercase`} value={form.motherName} onChange={(e) => setForm({ ...form, motherName: e.target.value })} /></Field>
          <Field label="Date of Birth"><input required type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></Field>
          <Field label="Contact Number"><input className={inputClass} value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} /></Field>
          <Field label="Course">
            <select required className={inputClass} value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
              <option value="">Select course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.courseName}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <Field label="Start Date"><input type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
          <Field label="End Date"><input type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
          <div className="sm:col-span-2">
            <Field label="Address"><textarea className={inputClass} rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Profile Photo">
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" className="hidden" id="student-photo-upload" onChange={handlePhotoUpload} />
                <label htmlFor="student-photo-upload" className={`${inputClass} cursor-pointer text-gray-500 flex-1 py-2`}>
                  {photoUploading ? "Uploading..." : profilePhotoPath || profilePhotoPreview ? "Change photo" : "Upload photo"}
                </label>
                {profilePhotoPreview && (
                  <img src={profilePhotoPreview} alt="preview" className="w-10 h-10 rounded-full object-cover border" />
                )}
              </div>
            </Field>
          </div>
          {formError && <div className="sm:col-span-2"><ErrorBanner message={formError} /></div>}
          <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || photoUploading}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.action === "archive" ? "Archive Student" : confirm?.action === "delete" ? "Delete Student" : "Restore Student"}
        message={confirm?.action === "delete" ? "This will permanently delete the student and all their marks. This cannot be undone. To hide a student without deleting, use Archive instead." : confirm?.action === "archive" ? "This will archive the student." : "This will restore the student."}
        confirmLabel={confirm?.action === "archive" ? "Archive" : confirm?.action === "delete" ? "Delete" : "Restore"}
        destructive={confirm?.action === "delete"}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Delete ${selected.size} Student${selected.size !== 1 ? "s" : ""}`}
        message="This will permanently delete all selected students and their marks. This cannot be undone."
        confirmLabel="Delete All"
        destructive
        onConfirm={bulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </div>
  );
}
