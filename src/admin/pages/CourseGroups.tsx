import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { Plus, Pencil, Trash2, Archive, RotateCcw, Download, Upload, FileSpreadsheet } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { adminApi } from "../../lib/api/admin";
import { PageHeader, Spinner, ErrorBanner, Button, Modal, ConfirmDialog, Field, inputClass, StatusBadge, PhotoAvatar } from "../components/ui";
import { downloadCsv, parseUploadedFile } from "../../lib/csv";

interface CourseGroup {
  id: string;
  name: string;
  description: string | null;
  imagePath: string | null;
  status: string;
  displayOrder: number;
  deletedAt: string | null;
  archivedAt: string | null;
}

export default function CourseGroups() {
  const [includeArchived, setIncludeArchived] = useState(false);
  const { data, loading, error, reload } = useApi(
    () => adminApi.list<CourseGroup>("course-groups", { includeArchived, pageSize: 100 }),
    [includeArchived]
  );

  const [editing, setEditing] = useState<CourseGroup | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", status: "active", displayOrder: 0, imagePath: "" });
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ action: "delete" | "archive" | "restore"; group: CourseGroup } | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", status: "active", displayOrder: 0, imagePath: "" });
    setImagePreviewUrl(null);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (group: CourseGroup) => {
    setEditing(group);
    setForm({
      name: group.name,
      description: group.description ?? "",
      status: group.status,
      displayOrder: group.displayOrder,
      imagePath: group.imagePath ?? "",
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
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        status: form.status,
        displayOrder: Number(form.displayOrder) || 0,
        imagePath: form.imagePath || null,
      };
      if (editing) await adminApi.update("course-groups", editing.id, payload);
      else await adminApi.create("course-groups", payload);
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
    const { action, group } = confirm;
    if (action === "delete") await adminApi.remove("course-groups", group.id);
    else if (action === "archive") await adminApi.archive("course-groups", group.id);
    else await adminApi.restore("course-groups", group.id);
    setConfirm(null);
    reload();
  };

  const items = data?.items ?? [];

  const handleDownload = () => {
    downloadCsv("course-groups.csv", ["name", "description", "status", "displayOrder"],
      items.map((g) => [g.name, g.description ?? "", g.status, g.displayOrder])
    );
  };

  const handleSample = () => {
    downloadCsv("course-groups_sample.csv", ["name", "description", "status", "displayOrder"], [
      ["Computer Courses", "Diploma and certificate computer programmes", "active", "1"],
      ["English Courses", "Spoken and written English programmes", "active", "2"],
    ]);
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    setUploadMsg(null);
    try {
      const rows = await parseUploadedFile(file);
      const results = await Promise.allSettled(
        rows.filter((r) => r["name"]?.trim()).map((r) =>
          adminApi.create("course-groups", {
            name: r["name"].trim(),
            description: r["description"]?.trim() || null,
            status: r["status"]?.trim() || "active",
            displayOrder: Number(r["displayOrder"]) || 0,
          })
        )
      );
      const ok = results.filter((r) => r.status === "fulfilled").length;
      const fail = results.filter((r) => r.status === "rejected").length;
      setUploadMsg(fail > 0 ? `${ok} imported, ${fail} failed` : `${ok} course groups imported`);
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
        title="Course Groups"
        subtitle="Public categories that frontend-visible courses are grouped under"
        actions={
          <>
            <Button variant="secondary" onClick={() => setIncludeArchived((v) => !v)}>
              {includeArchived ? "Hide Archived" : "Show Archived"}
            </Button>
            <Button onClick={openCreate}>
              <Plus size={16} /> New Course Group
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
                <th className="px-4 py-3 w-12"></th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold text-center">Order</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((group) => (
                <tr key={group.id} className={group.deletedAt || group.archivedAt ? "opacity-60" : ""}>
                  <td className="px-4 py-3"><PhotoAvatar src={null} name={group.name} size="sm" /></td>
                  <td className="px-4 py-3 font-medium text-gray-900">{group.name}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs"><p className="line-clamp-1 text-sm">{group.description ?? "—"}</p></td>
                  <td className="px-4 py-3 text-center text-gray-600">{group.displayOrder}</td>
                  <td className="px-4 py-3"><StatusBadge status={group.deletedAt ? "deleted" : group.archivedAt ? "inactive" : group.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {group.deletedAt ? (
                        <Button variant="ghost" onClick={() => setConfirm({ action: "restore", group })}><RotateCcw size={16} /></Button>
                      ) : (
                        <>
                          <Button variant="ghost" onClick={() => openEdit(group)}><Pencil size={16} /></Button>
                          <Button variant="ghost" onClick={() => setConfirm({ action: "archive", group })}><Archive size={16} /></Button>
                          <Button variant="ghost" onClick={() => setConfirm({ action: "delete", group })}><Trash2 size={16} className="text-red-500" /></Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No course groups found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Course Group" : "New Course Group"}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Field label="Name">
            <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
            <Field label="Display Order">
              <input type="number" className={inputClass} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Description">
            <textarea rows={3} className={inputClass + " resize-none"} placeholder="Short description for this group" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Group Image">
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" className="hidden" id="group-img-upload" onChange={handleImageUpload} />
              <label htmlFor="group-img-upload" className={`${inputClass} cursor-pointer text-gray-500 flex-1 py-2`}>
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
        title={confirm?.action === "delete" ? "Delete Course Group" : confirm?.action === "archive" ? "Archive Course Group" : "Restore Course Group"}
        message={
          confirm?.action === "delete"
            ? "This will soft-delete the course group. Courses linked to it will no longer appear on the frontend until reassigned."
            : confirm?.action === "archive"
            ? "This will archive the course group and hide it (and its courses) from the frontend."
            : "This will restore the course group."
        }
        confirmLabel={confirm?.action === "delete" ? "Delete" : confirm?.action === "archive" ? "Archive" : "Restore"}
        destructive={confirm?.action === "delete"}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
