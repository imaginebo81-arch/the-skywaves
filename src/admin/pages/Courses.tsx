import { useEffect, useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { Plus, Pencil, Trash2, Archive, RotateCcw, Download, Upload, FileSpreadsheet, Check, EyeOff } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { adminApi } from "../../lib/api/admin";
import { PageHeader, Spinner, ErrorBanner, Button, Modal, ConfirmDialog, Field, inputClass, StatusBadge } from "../components/ui";
import { downloadCsv, parseUploadedFile } from "../../lib/csv";

interface Course {
  id: string;
  courseName: string;
  status: string;
  description: string | null;
  imagePath: string | null;
  courseGroupId: string | null;
  frontendVisible: boolean;
  deletedAt: string | null;
  archivedAt: string | null;
}

interface CourseGroupOption {
  id: string;
  name: string;
}

export default function Courses() {
  const [includeArchived, setIncludeArchived] = useState(false);
  const { data, loading, error, reload } = useApi(
    () => adminApi.list<Course>("courses", { includeArchived, pageSize: 100 }),
    [includeArchived]
  );

  const [groups, setGroups] = useState<CourseGroupOption[]>([]);
  const groupName = (id: string | null) => groups.find((g) => g.id === id)?.name ?? "—";

  useEffect(() => {
    adminApi.list<CourseGroupOption>("course-groups", { pageSize: 100 })
      .then((res) => setGroups(res.items))
      .catch(() => setGroups([]));
  }, []);

  const [editing, setEditing] = useState<Course | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ courseName: "", status: "active", description: "", imagePath: "", courseGroupId: "", frontendVisible: true });
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ action: "delete" | "archive" | "restore"; course: Course } | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ courseName: "", status: "active", description: "", imagePath: "", courseGroupId: groups[0]?.id ?? "", frontendVisible: true });
    setImagePreviewUrl(null);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (course: Course) => {
    setEditing(course);
    setForm({
      courseName: course.courseName,
      status: course.status,
      description: course.description ?? "",
      imagePath: course.imagePath ?? "",
      courseGroupId: course.courseGroupId ?? "",
      frontendVisible: course.frontendVisible,
    });
    setImagePreviewUrl(null);
    setFormError(null);
    setShowForm(true);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImageUploading(true);
    try {
      const res = await adminApi.uploadCourseImage(file);
      setForm((f) => ({ ...f, imagePath: res.path }));
      setImagePreviewUrl(res.url ?? null);
    } catch {
      setFormError("Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.courseGroupId) {
      setFormError("Please select a course group");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        courseName: form.courseName,
        status: form.status,
        description: form.description || null,
        imagePath: form.imagePath || null,
        courseGroupId: form.courseGroupId,
        frontendVisible: form.frontendVisible,
      };
      if (editing) await adminApi.update("courses", editing.id, payload);
      else await adminApi.create("courses", payload);
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    const { action, course } = confirm;
    if (action === "delete") await adminApi.remove("courses", course.id);
    else if (action === "archive") await adminApi.archive("courses", course.id);
    else await adminApi.restore("courses", course.id);
    setConfirm(null);
    reload();
  };

  const items = data?.items ?? [];

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const toggleAll = () => setSelected(selected.size === items.length && items.length > 0 ? new Set() : new Set(items.map(c => c.id)));

  const bulkDelete = async () => {
    await Promise.allSettled([...selected].map(id => adminApi.remove("courses", id)));
    setSelected(new Set());
    setConfirmBulkDelete(false);
    reload();
  };

  const handleDownload = () => {
    downloadCsv("courses.csv", ["courseName", "courseGroup", "frontendVisible", "status", "description"],
      items.map(c => [c.courseName, groupName(c.courseGroupId), c.frontendVisible ? "true" : "false", c.status, c.description ?? ""])
    );
  };

  const handleSample = () => {
    downloadCsv("courses_sample.csv", ["courseName", "courseGroup", "frontendVisible", "status", "description"], [
      ["Diploma in Computer Applications", "Computer Courses", "true", "active", "Master essential computer skills for the modern workplace"],
      ["Advanced Spoken English", "English Courses", "false", "active", "Conversational English for professionals"],
    ]);
  };

  const parseBool = (v: string | undefined) => {
    const s = (v ?? "").trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes" || s === "y";
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    setUploadMsg(null);
    try {
      const rows = await parseUploadedFile(file);
      const groupByName = new Map(groups.map((g) => [g.name.toLowerCase(), g.id]));
      let skipped = 0;
      const creatable = rows
        .filter((r) => r["courseName"]?.trim())
        .map((r) => {
          const gid = groupByName.get((r["courseGroup"] ?? "").trim().toLowerCase());
          if (!gid) { skipped++; return null; }
          return adminApi.create("courses", {
            courseName: r["courseName"].trim(),
            status: r["status"]?.trim() || "active",
            description: r["description"]?.trim() || null,
            courseGroupId: gid,
            frontendVisible: parseBool(r["frontendVisible"]),
          });
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);
      const results = await Promise.allSettled(creatable);
      const ok = results.filter(r => r.status === "fulfilled").length;
      const fail = results.filter(r => r.status === "rejected").length + skipped;
      setUploadMsg(`${ok} imported${fail > 0 ? `, ${fail} failed${skipped > 0 ? ` (${skipped} unknown course group)` : ""}` : ""}`);
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
        title="Courses"
        subtitle="Academic courses used for subjects, marks and enrollment"
        actions={
          <>
            <Button variant="secondary" onClick={() => setIncludeArchived((v) => !v)}>
              {includeArchived ? "Hide Archived" : "Show Archived"}
            </Button>
            <Button onClick={openCreate}>
              <Plus size={16} /> New Course
            </Button>
          </>
        }
      />

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

      {groups.length === 0 && !loading && (
        <div className="mb-4">
          <ErrorBanner message="No course groups exist yet. Create a Course Group first — every course must belong to one." />
        </div>
      )}

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
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Course Group</th>
                <th className="px-4 py-3 font-semibold text-center">Frontend</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((course) => (
                <tr key={course.id} className={`${course.deletedAt || course.archivedAt ? "opacity-60" : ""} ${selected.has(course.id) ? "bg-orange-50" : ""}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(course.id)} onChange={() => toggleSelect(course.id)} className="cursor-pointer accent-[#eaa320]" />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{course.courseName}</td>
                  <td className="px-4 py-3 text-gray-600">{groupName(course.courseGroupId)}</td>
                  <td className="px-4 py-3 text-center">
                    {course.frontendVisible ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold"><Check size={14} /> Visible</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-semibold"><EyeOff size={14} /> Hidden</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={course.deletedAt ? "deleted" : course.archivedAt ? "inactive" : course.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {course.deletedAt ? (
                        <Button variant="ghost" onClick={() => setConfirm({ action: "restore", course })}><RotateCcw size={16} /></Button>
                      ) : (
                        <>
                          <Button variant="ghost" onClick={() => openEdit(course)}><Pencil size={16} /></Button>
                          <Button variant="ghost" onClick={() => setConfirm({ action: "archive", course })}><Archive size={16} /></Button>
                          <Button variant="ghost" onClick={() => setConfirm({ action: "delete", course })}><Trash2 size={16} className="text-red-500" /></Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No courses found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Course" : "New Course"}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Field label="Course Name">
            <input required className={inputClass} value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} />
          </Field>
          <Field label="Course Group">
            <select required className={inputClass} value={form.courseGroupId} onChange={(e) => setForm({ ...form, courseGroupId: e.target.value })}>
              <option value="" disabled>Select a course group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={form.frontendVisible} onChange={(e) => setForm({ ...form, frontendVisible: e.target.checked })} className="cursor-pointer accent-[#eaa320] w-4 h-4" />
            <span className="font-medium text-gray-700">Frontend visible</span>
            <span className="text-gray-400 text-xs">(show this course on the public website)</span>
          </label>
          <Field label="Description">
            <textarea rows={3} className={inputClass + " resize-none"} placeholder="Short description for this course" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Course Image">
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" className="hidden" id="course-img-upload" onChange={handleImageUpload} />
              <label htmlFor="course-img-upload" className={`${inputClass} cursor-pointer text-gray-500 flex-1 py-2`}>
                {imageUploading ? "Uploading..." : form.imagePath ? "Change image" : "Upload image"}
              </label>
              {imagePreviewUrl && (
                <img src={imagePreviewUrl} alt="preview" className="w-10 h-10 rounded object-cover border" />
              )}
              {form.imagePath && !imagePreviewUrl && (
                <span className="text-xs text-gray-400 truncate max-w-[120px]">{form.imagePath.split("/").pop()}</span>
              )}
            </div>
          </Field>
          {formError && <ErrorBanner message={formError} />}
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || imageUploading}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.action === "delete" ? "Delete Course" : confirm?.action === "archive" ? "Archive Course" : "Restore Course"}
        message={
          confirm?.action === "delete"
            ? "This will soft-delete the course. You can restore it later from the archived view."
            : confirm?.action === "archive"
            ? "This will archive the course and hide it from active lists."
            : "This will restore the course."
        }
        confirmLabel={confirm?.action === "delete" ? "Delete" : confirm?.action === "archive" ? "Archive" : "Restore"}
        destructive={confirm?.action === "delete"}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Delete ${selected.size} Course${selected.size !== 1 ? "s" : ""}`}
        message="This will soft-delete all selected courses. They can be restored later from the archived view."
        confirmLabel="Delete All"
        destructive
        onConfirm={bulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </div>
  );
}
