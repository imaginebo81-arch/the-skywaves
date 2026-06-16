import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { Plus, Pencil, Archive, Trash2, RotateCcw, Search, Download, Upload, FileSpreadsheet } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { adminApi } from "../../lib/api/admin";
import { ApiError } from "../../lib/api/client";
import { PageHeader, Spinner, ErrorBanner, Button, Modal, ConfirmDialog, Field, inputClass, StatusBadge } from "../components/ui";
import { downloadCsv, parseUploadedFile } from "../../lib/csv";

interface Employee {
  employmentReferenceNumber: string;
  name: string;
  fatherName: string | null;
  dateOfBirth: string;
  address: string | null;
  joiningDate: string | null;
  leavingDate: string | null;
  designation: string | null;
  certificateTemplateVariables: Record<string, unknown>;
  status: string;
  deletedAt: string | null;
  archivedAt: string | null;
}

const DEFAULT_TEMPLATE_VARS = JSON.stringify({
  place: "New Delhi",
  work: "teaching and administrative duties",
  duration: "",
}, null, 2);

const EMPTY = {
  employmentReferenceNumber: "", name: "", fatherName: "", dateOfBirth: "",
  address: "", joiningDate: "", leavingDate: "", designation: "", status: "active", templateVars: DEFAULT_TEMPLATE_VARS,
};

export default function Employees() {
  const [q, setQ] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const { data, loading, error, reload } = useApi(
    () => adminApi.list<Employee>("employees", { q: q || undefined, includeArchived, pageSize: 100 }),
    [includeArchived]
  );

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ action: "archive" | "delete" | "restore"; emp: Employee } | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (e: Employee) => {
    setEditing(e);
    setForm({
      employmentReferenceNumber: e.employmentReferenceNumber, name: e.name, fatherName: e.fatherName ?? "",
      dateOfBirth: e.dateOfBirth, address: e.address ?? "", joiningDate: e.joiningDate ?? "",
      leavingDate: e.leavingDate ?? "", designation: e.designation ?? "", status: e.status,
      templateVars: JSON.stringify(e.certificateTemplateVariables ?? {}, null, 2),
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSave = async (ev: FormEvent) => {
    ev.preventDefault();
    setSaving(true);
    setFormError(null);
    let templateVars: Record<string, unknown> = {};
    try {
      templateVars = form.templateVars.trim() ? JSON.parse(form.templateVars) : {};
    } catch {
      setFormError("Template variables must be valid JSON");
      setSaving(false);
      return;
    }
    const payload = {
      name: form.name, fatherName: form.fatherName || null, dateOfBirth: form.dateOfBirth,
      address: form.address || null, joiningDate: form.joiningDate || null, leavingDate: form.leavingDate || null,
      designation: form.designation || null, status: form.status, certificateTemplateVariables: templateVars,
    };
    try {
      if (editing) await adminApi.update("employees", editing.employmentReferenceNumber, payload);
      else await adminApi.create("employees", { employmentReferenceNumber: form.employmentReferenceNumber, ...payload });
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save employee");
    } finally {
      setSaving(false);
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    const { action, emp } = confirm;
    const id = emp.employmentReferenceNumber;
    if (action === "archive") await adminApi.archive("employees", id);
    else if (action === "delete") await adminApi.remove("employees", id);
    else await adminApi.restore("employees", id);
    setConfirm(null);
    reload();
  };

  const items = data?.items ?? [];

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const toggleAll = () => setSelected(selected.size === items.length && items.length > 0 ? new Set() : new Set(items.map(e => e.employmentReferenceNumber)));

  const bulkDelete = async () => {
    await Promise.allSettled([...selected].map(id => adminApi.remove("employees", id)));
    setSelected(new Set());
    setConfirmBulkDelete(false);
    reload();
  };

  const handleDownload = () => {
    downloadCsv("employees.csv",
      ["employmentReferenceNumber", "name", "fatherName", "dateOfBirth", "designation", "address", "joiningDate", "leavingDate", "status"],
      items.map(e => [e.employmentReferenceNumber, e.name, e.fatherName ?? "", e.dateOfBirth, e.designation ?? "", e.address ?? "", e.joiningDate ?? "", e.leavingDate ?? "", e.status])
    );
  };

  const handleSample = () => {
    downloadCsv("employees_sample.csv",
      ["employmentReferenceNumber", "name", "fatherName", "dateOfBirth", "designation", "address", "joiningDate", "leavingDate", "status"],
      [["EMP001", "Priya Verma", "Mohan Verma", "1990-03-20", "Teacher", "456 Park Ave, Mumbai", "2020-06-01", "", "active"]]
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
      const validRows = rows.filter(r => r["employmentReferenceNumber"]?.trim() && r["name"]?.trim());
      if (validRows.length === 0) { setUploadMsg("No valid rows found"); setUploading(false); return; }
      let created = 0, updated = 0, failed = 0, lastErr = "";
      for (const r of validRows) {
        const ref = r["employmentReferenceNumber"].trim();
        const updatePayload = {
          name: r["name"].trim(),
          fatherName: r["fatherName"] || null,
          dateOfBirth: r["dateOfBirth"],
          designation: r["designation"] || null,
          address: r["address"] || null,
          joiningDate: r["joiningDate"] || null,
          leavingDate: r["leavingDate"] || null,
          status: r["status"] || "active",
          certificateTemplateVariables: {},
        };
        try {
          await adminApi.create("employees", { employmentReferenceNumber: ref, ...updatePayload });
          created++;
        } catch (createErr) {
          if (createErr instanceof ApiError && createErr.status === 409) {
            try {
              await adminApi.update("employees", ref, updatePayload);
              updated++;
            } catch (updateErr) {
              lastErr = updateErr instanceof Error ? updateErr.message : "update failed";
              failed++;
            }
          } else {
            const detail = createErr instanceof ApiError && Array.isArray(createErr.details)
              ? (createErr.details as { path: string[]; message: string }[]).map(i => `${i.path.join(".")}: ${i.message}`).join("; ")
              : "";
            lastErr = detail || (createErr instanceof Error ? createErr.message : "unknown error");
            failed++;
          }
        }
      }
      const parts: string[] = [];
      if (created > 0) parts.push(`${created} imported`);
      if (updated > 0) parts.push(`${updated} updated`);
      if (failed > 0) parts.push(`${failed} failed${lastErr ? ` (${lastErr})` : ""}`);
      setUploadMsg(parts.length ? parts.join(", ") : "No rows processed");
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
        title="Employees"
        subtitle="Register and manage employees for verification"
        actions={
          <>
            <Button variant="secondary" onClick={() => setIncludeArchived((v) => !v)}>{includeArchived ? "Hide Archived" : "Show Archived"}</Button>
            <Button onClick={openCreate}><Plus size={16} /> New Employee</Button>
          </>
        }
      />

      <form onSubmit={(e) => { e.preventDefault(); reload(); }} className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input className={`${inputClass} pl-10`} placeholder="Search by name, reference or designation" value={q} onChange={(e) => setQ(e.target.value)} />
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
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Reference No.</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Father Name</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Date of Birth</th>
                <th className="px-4 py-3 font-semibold">Designation</th>
                <th className="px-4 py-3 font-semibold">Address</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Joining Date</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Leaving Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((emp) => (
                <tr key={emp.employmentReferenceNumber} className={`${emp.deletedAt || emp.archivedAt ? "opacity-60" : ""} ${selected.has(emp.employmentReferenceNumber) ? "bg-orange-50" : ""}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(emp.employmentReferenceNumber)} onChange={() => toggleSelect(emp.employmentReferenceNumber)} className="cursor-pointer accent-[#eaa320]" />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{emp.employmentReferenceNumber}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{emp.name}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{emp.fatherName ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{emp.dateOfBirth ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{emp.designation ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{emp.address ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{emp.joiningDate ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{emp.leavingDate ?? "-"}</td>
                  <td className="px-4 py-3"><StatusBadge status={emp.deletedAt ? "deleted" : emp.archivedAt ? "inactive" : (emp.leavingDate ? "completed" : emp.status)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {emp.deletedAt ? (
                        <Button variant="ghost" onClick={() => setConfirm({ action: "restore", emp })}><RotateCcw size={16} /></Button>
                      ) : (
                        <>
                          <Button variant="ghost" onClick={() => openEdit(emp)}><Pencil size={16} /></Button>
                          <Button variant="ghost" onClick={() => setConfirm({ action: "archive", emp })}><Archive size={16} /></Button>
                          <Button variant="ghost" onClick={() => setConfirm({ action: "delete", emp })}><Trash2 size={16} className="text-red-500" /></Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={11} className="px-4 py-10 text-center text-gray-400">No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Employee" : "New Employee"} wide>
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Employment Reference Number">
            <input required disabled={!!editing} className={`${inputClass} disabled:bg-gray-100`} value={form.employmentReferenceNumber} onChange={(e) => setForm({ ...form, employmentReferenceNumber: e.target.value })} />
          </Field>
          <Field label="Name"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Father Name"><input className={inputClass} value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} /></Field>
          <Field label="Date of Birth"><input required type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></Field>
          <Field label="Designation"><input className={inputClass} value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></Field>
          <Field label="Status">
            <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <Field label="Joining Date"><input type="date" className={inputClass} value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} /></Field>
          <Field label="Leaving Date (blank if working)"><input type="date" className={inputClass} value={form.leavingDate} onChange={(e) => setForm({ ...form, leavingDate: e.target.value })} /></Field>
          <div className="sm:col-span-2">
            <Field label="Address"><textarea className={inputClass} rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Certificate Template Variables (JSON)">
              <textarea className={`${inputClass} font-mono text-xs`} rows={3} value={form.templateVars} onChange={(e) => setForm({ ...form, templateVars: e.target.value })} />
            </Field>
          </div>
          {formError && <div className="sm:col-span-2"><ErrorBanner message={formError} /></div>}
          <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.action === "archive" ? "Archive Employee" : confirm?.action === "delete" ? "Delete Employee" : "Restore Employee"}
        message={confirm?.action === "delete" ? "This will soft-delete the employee. They can be restored later." : confirm?.action === "archive" ? "This will archive the employee." : "This will restore the employee."}
        confirmLabel={confirm?.action === "archive" ? "Archive" : confirm?.action === "delete" ? "Delete" : "Restore"}
        destructive={confirm?.action === "delete"}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Delete ${selected.size} Employee${selected.size !== 1 ? "s" : ""}`}
        message="This will soft-delete all selected employees. They can be restored later."
        confirmLabel="Delete All"
        destructive
        onConfirm={bulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </div>
  );
}
