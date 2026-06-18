import { useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { adminApi } from "../../lib/api/admin";
import { PageHeader, Spinner, ErrorBanner, Button, Modal, ConfirmDialog, Field, inputClass, PhotoAvatar } from "../components/ui";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  image_url: string | null;
  source: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function TestimonialsAdmin() {
  const { data, loading, error, reload } = useApi(
    () => adminApi.list<Testimonial>("testimonials", { pageSize: 100 }),
    []
  );

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({ name: "", role: "", quote: "", image_url: "", display_order: 0, is_active: true });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Testimonial | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", role: "", quote: "", image_url: "", display_order: data?.items?.length ?? 0, is_active: true });
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({
      name: t.name,
      role: t.role ?? "",
      quote: t.quote,
      image_url: t.image_url ?? "",
      display_order: t.display_order,
      is_active: t.is_active,
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: form.name,
        role: form.role || null,
        quote: form.quote,
        image_url: form.image_url || null,
        display_order: form.display_order,
        is_active: form.is_active,
      };
      if (editing) {
        await adminApi.update("testimonials", editing.id, payload);
      } else {
        await adminApi.create("testimonials", payload);
      }
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const runDelete = async () => {
    if (!confirm) return;
    await adminApi.remove("testimonials", confirm.id).catch(() => {});
    setConfirm(null);
    reload();
  };

  const items = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Testimonials"
        subtitle="Manage testimonials shown on the homepage"
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} /> Add Testimonial
          </Button>
        }
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorBanner message={error} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold w-12">Order</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Quote</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Active</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((t) => (
                <tr key={t.id} className={t.is_active ? "" : "opacity-50"}>
                  <td className="px-4 py-3 text-gray-500">{t.display_order}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <PhotoAvatar src={t.image_url} name={t.name} />
                      {t.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.role ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <p className="line-clamp-2">{t.quote}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.source === "feedback" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                      {t.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${t.is_active ? "text-green-600" : "text-gray-400"}`}>
                      {t.is_active ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" onClick={() => openEdit(t)}><Pencil size={16} /></Button>
                      <Button variant="ghost" onClick={() => setConfirm(t)}><Trash2 size={16} className="text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    No testimonials yet. Add one or approve a feedback submission.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Testimonial" : "Add Testimonial"}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name">
              <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Role / Profession">
              <input className={inputClass} placeholder="e.g. Student" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </Field>
          </div>
          <Field label="Quote">
            <textarea required rows={3} className={inputClass + " resize-none"} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
          </Field>
          <Field label="Image URL (optional)">
            <input className={inputClass} placeholder="https://..." value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Display Order">
              <input type="number" className={inputClass} value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
            </Field>
            <Field label="Active">
              <select className={inputClass} value={form.is_active ? "yes" : "no"} onChange={(e) => setForm({ ...form, is_active: e.target.value === "yes" })}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </Field>
          </div>
          {formError && <ErrorBanner message={formError} />}
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete Testimonial"
        message="This will remove this testimonial from the website."
        confirmLabel="Delete"
        destructive
        onConfirm={runDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
