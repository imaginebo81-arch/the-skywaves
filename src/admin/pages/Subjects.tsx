import { useEffect, useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { Plus, Pencil, Trash2, Download, Upload, FileSpreadsheet } from "lucide-react";
import { adminApi } from "../../lib/api/admin";
import { PageHeader, Spinner, ErrorBanner, Button, Modal, ConfirmDialog, Field, inputClass, PhotoAvatar } from "../components/ui";
import { downloadCsv, parseUploadedFile } from "../../lib/csv";

interface Course {
  id: string;
  courseName: string;
}
interface Subject {
  id: string;
  courseId: string;
  subjectName: string;
  minMarks: number;
  maxMarks: number;
  displayOrder: number;
  description: string | null;
  imagePath: string | null;
  imageUrl: string | null;
  duration: string | null;
}

export default function Subjects() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState({ subjectName: "", minMarks: 35, maxMarks: 100, displayOrder: 0, description: "", imagePath: "", duration: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Subject | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminApi
      .list<Course>("courses", { pageSize: 100 })
      .then((res) => {
        setCourses(res.items);
        if (res.items[0]) setCourseId(res.items[0].id);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load courses"))
      .finally(() => setLoading(false));
  }, []);

  const loadSubjects = (cid: string) => {
    if (!cid) return;
    adminApi
      .subjectsByCourse<Subject>(cid)
      .then((res) => setSubjects(res.items))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load subjects"));
  };

  useEffect(() => {
    if (courseId) loadSubjects(courseId);
  }, [courseId]);

  const openCreate = () => {
    setEditing(null);
    setForm({ subjectName: "", minMarks: 35, maxMarks: 100, displayOrder: subjects.length, description: "", imagePath: "", duration: "" });
    setImagePreviewUrl(null);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (s: Subject) => {
    setEditing(s);
    setForm({ subjectName: s.subjectName, minMarks: s.minMarks, maxMarks: s.maxMarks, displayOrder: s.displayOrder, description: s.description ?? "", imagePath: s.imagePath ?? "", duration: s.duration ?? "" });
    setImagePreviewUrl(s.imageUrl ?? null);
    setFormError(null);
    setShowForm(true);
  };

  const handleImageUploadSubject = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImageUploading(true);
    try {
      const res = await adminApi.uploadSubjectImage(file);
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
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        subjectName: form.subjectName,
        minMarks: form.minMarks,
        maxMarks: form.maxMarks,
        displayOrder: form.displayOrder,
        description: form.description || null,
        imagePath: form.imagePath || null,
        duration: form.duration || null,
      };
      if (editing) {
        await adminApi.update("subjects", editing.id, payload);
      } else {
        await adminApi.create("subjects", { courseId, ...payload });
      }
      setShowForm(false);
      loadSubjects(courseId);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save subject");
    } finally {
      setSaving(false);
    }
  };

  const runDelete = async () => {
    if (!confirm) return;
    await adminApi.remove("subjects", confirm.id);
    setConfirm(null);
    loadSubjects(courseId);
  };

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const toggleAll = () => setSelected(selected.size === subjects.length && subjects.length > 0 ? new Set() : new Set(subjects.map(s => s.id)));

  const bulkDelete = async () => {
    await Promise.allSettled([...selected].map(id => adminApi.remove("subjects", id)));
    setSelected(new Set());
    setConfirmBulkDelete(false);
    loadSubjects(courseId);
  };

  const handleDownload = () => {
    downloadCsv("subjects.csv", ["subjectName", "duration", "minMarks", "maxMarks", "description"],
      subjects.map(s => [s.subjectName, s.duration ?? "", s.minMarks, s.maxMarks, s.description ?? ""])
    );
  };

  const handleSample = () => {
    downloadCsv("subjects_sample.csv", ["subjectName", "duration", "minMarks", "maxMarks", "description"], [
      ["Theory of Design", "3 Months", "35", "100", "Fundamentals of design theory and principles"],
      ["Practical Workshop", "2 Months", "40", "100", "Hands-on practical sessions with expert guidance"],
    ]);
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!courseId) { setUploadMsg("Select a course first"); return; }
    setUploading(true);
    setUploadMsg(null);
    try {
      const rows = await parseUploadedFile(file);
      const results = await Promise.allSettled(
        rows.filter(r => r["subjectName"]?.trim()).map(r =>
          adminApi.create("subjects", {
            courseId,
            subjectName: r["subjectName"].trim(),
            minMarks: Number(r["minMarks"]) || 35,
            maxMarks: Number(r["maxMarks"]) || 100,
            displayOrder: Number(r["displayOrder"]) || 0,
          })
        )
      );
      const ok = results.filter(r => r.status === "fulfilled").length;
      const fail = results.filter(r => r.status === "rejected").length;
      setUploadMsg(fail > 0 ? `${ok} imported, ${fail} failed` : `${ok} subjects imported`);
      loadSubjects(courseId);
    } catch {
      setUploadMsg("Failed to parse file");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Subjects"
        subtitle="Manage subjects and marks configuration per course"
        actions={courseId ? <Button onClick={openCreate}><Plus size={16} /> New Subject</Button> : undefined}
      />

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <div className="mb-4 max-w-sm">
        <Field label="Course">
          <select className={inputClass} value={courseId} onChange={(e) => { setCourseId(e.target.value); setSelected(new Set()); }}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.courseName}</option>
            ))}
          </select>
        </Field>
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={selected.size === subjects.length && subjects.length > 0} onChange={toggleAll} className="cursor-pointer accent-[#eaa320]" />
              </th>
              <th className="px-4 py-3 w-12"></th>
              <th className="px-4 py-3 font-semibold">Subject</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold text-center">Min</th>
              <th className="px-4 py-3 font-semibold text-center">Max</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subjects.map((s) => (
              <tr key={s.id} className={selected.has(s.id) ? "bg-orange-50" : ""}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} className="cursor-pointer accent-[#eaa320]" />
                </td>
                <td className="px-4 py-3">
                  <PhotoAvatar src={s.imageUrl} name={s.subjectName} size="sm" />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{s.subjectName}</td>
                <td className="px-4 py-3 text-gray-600">{s.duration ?? "—"}</td>
                <td className="px-4 py-3 text-center text-gray-600">{s.minMarks}</td>
                <td className="px-4 py-3 text-center text-gray-600">{s.maxMarks}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[200px]"><p className="line-clamp-1 text-xs">{s.description ?? "—"}</p></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" onClick={() => openEdit(s)}><Pencil size={16} /></Button>
                    <Button variant="ghost" onClick={() => setConfirm(s)}><Trash2 size={16} className="text-red-500" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No subjects for this course.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Subject" : "New Subject"}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Field label="Subject Name">
            <input required className={inputClass} value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min Marks">
              <input type="number" className={inputClass} value={form.minMarks} onChange={(e) => setForm({ ...form, minMarks: Number(e.target.value) })} />
            </Field>
            <Field label="Max Marks">
              <input type="number" className={inputClass} value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Duration">
            <input className={inputClass} placeholder="e.g. 3 Months, 1 Year" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          </Field>
          <Field label="Description">
            <textarea rows={2} className={inputClass + " resize-none"} placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Subject Image">
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" className="hidden" id="subject-img-upload" onChange={handleImageUploadSubject} />
              <label htmlFor="subject-img-upload" className={`${inputClass} cursor-pointer text-gray-500 flex-1 py-2`}>
                {imageUploading ? "Uploading..." : form.imagePath ? "Change image" : "Upload image"}
              </label>
              {imagePreviewUrl && (
                <img src={imagePreviewUrl} alt="preview" className="w-10 h-10 rounded object-cover border" />
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
        title="Delete Subject"
        message="This will remove the subject. Existing student marks for it remain in history."
        confirmLabel="Delete"
        destructive
        onConfirm={runDelete}
        onCancel={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Delete ${selected.size} Subject${selected.size !== 1 ? "s" : ""}`}
        message="This will remove all selected subjects. Existing student marks for them remain in history."
        confirmLabel="Delete All"
        destructive
        onConfirm={bulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </div>
  );
}
