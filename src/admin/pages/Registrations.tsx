import { useState, type FormEvent } from "react";
import { Search, Eye, Check, X, Trash2, RotateCcw } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { adminApi } from "../../lib/api/admin";
import { PageHeader, Spinner, ErrorBanner, Button, Modal, ConfirmDialog, Field, inputClass, StatusBadge } from "../components/ui";

interface Registration {
  id: string;
  admissionNumber: string;
  admissionDate: string;
  name: string;
  fatherName: string | null;
  motherName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  contactNumber: string | null;
  courseName: string | null;
  profilePhotoUrl: string | null;
  status: string;
  studentRollNumber: string | null;
  deletedAt: string | null;
}

export default function Registrations() {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const { data, loading, error, reload } = useApi(
    () => adminApi.list<Registration>("registrations", { status: status || undefined, q: q || undefined, includeArchived, pageSize: 100 }),
    [status, includeArchived]
  );

  const [view, setView] = useState<Registration | null>(null);
  const [approving, setApproving] = useState<Registration | null>(null);
  const [rollNumber, setRollNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ action: "reject" | "delete" | "restore"; reg: Registration } | null>(null);

  const handleApprove = async (e: FormEvent) => {
    e.preventDefault();
    if (!approving) return;
    setSaving(true);
    setFormError(null);
    try {
      await adminApi.approveRegistration(approving.id, rollNumber.trim(), startDate || undefined, endDate || undefined);
      setApproving(null);
      setRollNumber("");
      setStartDate("");
      setEndDate("");
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setSaving(false);
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    const { action, reg } = confirm;
    if (action === "reject") await adminApi.rejectRegistration(reg.id);
    else if (action === "delete") await adminApi.remove("registrations", reg.id);
    else await adminApi.restore("registrations", reg.id);
    setConfirm(null);
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Registrations"
        subtitle="Review and approve student enrollment requests"
        actions={
          <Button variant="secondary" onClick={() => setIncludeArchived((v) => !v)}>
            {includeArchived ? "Hide Archived" : "Show Archived"}
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            reload();
          }}
          className="flex-1 relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input className={`${inputClass} pl-10`} placeholder="Search by name, admission number, phone" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
        <select className={`${inputClass} sm:w-48`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
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
                <th className="px-4 py-3 font-semibold w-12">Photo</th>
                <th className="px-4 py-3 font-semibold">Adm. No.</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Father Name</th>
                <th className="px-4 py-3 font-semibold">Mother Name</th>
                <th className="px-4 py-3 font-semibold">Date of Birth</th>
                <th className="px-4 py-3 font-semibold">Gender</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Address</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.items.map((reg) => (
                <tr key={reg.id} className={reg.deletedAt ? "opacity-60" : ""}>
                  <td className="px-4 py-3">
                    {reg.profilePhotoUrl ? (
                      <img src={reg.profilePhotoUrl} alt={reg.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">-</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{reg.admissionNumber}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{reg.name}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{reg.fatherName ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{reg.motherName ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{reg.dateOfBirth ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{reg.gender ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{reg.courseName ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{reg.contactNumber ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">{reg.address ?? "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={reg.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" onClick={() => setView(reg)}><Eye size={16} /></Button>
                      {reg.status === "pending" && !reg.deletedAt && (
                        <>
                          <Button variant="ghost" onClick={() => setApproving(reg)}><Check size={16} className="text-green-600" /></Button>
                          <Button variant="ghost" onClick={() => setConfirm({ action: "reject", reg })}><X size={16} className="text-amber-600" /></Button>
                        </>
                      )}
                      {reg.deletedAt ? (
                        <Button variant="ghost" onClick={() => setConfirm({ action: "restore", reg })}><RotateCcw size={16} /></Button>
                      ) : (
                        <Button variant="ghost" onClick={() => setConfirm({ action: "delete", reg })}><Trash2 size={16} className="text-red-500" /></Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr><td colSpan={12} className="px-4 py-10 text-center text-gray-400">No registrations found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!view} onClose={() => setView(null)} title="Registration Details" wide>
        {view && (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              {view.profilePhotoUrl ? (
                <img src={view.profilePhotoUrl} alt={view.name} className="w-40 h-40 rounded-xl object-cover border border-gray-200" />
              ) : (
                <div className="w-40 h-40 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">No photo</div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 flex-1 text-sm">
              <Detail label="Admission Number" value={view.admissionNumber} />
              <Detail label="Admission Date" value={view.admissionDate} />
              <Detail label="Name" value={view.name} />
              <Detail label="Father Name" value={view.fatherName ?? "-"} />
              <Detail label="Mother Name" value={view.motherName ?? "-"} />
              <Detail label="Date of Birth" value={view.dateOfBirth ?? "-"} />
              <Detail label="Gender" value={view.gender ?? "-"} />
              <Detail label="Contact" value={view.contactNumber ?? "-"} />
              <Detail label="Course" value={view.courseName ?? "-"} />
              <Detail label="Status" value={view.status} />
              <div className="sm:col-span-2"><Detail label="Address" value={view.address ?? "-"} /></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!approving} onClose={() => setApproving(null)} title="Approve Registration">
        <form onSubmit={handleApprove} className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Approving <strong>{approving?.name}</strong>. Assign a roll number to create the student record. Subject marks rows
            will be created automatically.
          </p>
          <Field label="Roll Number">
            <input required className={inputClass} value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="e.g. SKY-24-10592" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date"><input type="date" className={inputClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} /></Field>
            <Field label="End Date"><input type="date" className={inputClass} value={endDate} onChange={(e) => setEndDate(e.target.value)} /></Field>
          </div>
          {formError && <ErrorBanner message={formError} />}
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setApproving(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Approving..." : "Approve & Enroll"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.action === "reject" ? "Reject Registration" : confirm?.action === "delete" ? "Delete Registration" : "Restore Registration"}
        message={
          confirm?.action === "reject"
            ? "This will mark the registration as rejected and archive it. It will not be deleted."
            : confirm?.action === "delete"
            ? "This will soft-delete the registration. It can be restored from the archived view."
            : "This will restore the registration."
        }
        confirmLabel={confirm?.action === "reject" ? "Reject" : confirm?.action === "delete" ? "Delete" : "Restore"}
        destructive={confirm?.action === "delete"}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-gray-500 text-xs uppercase tracking-wide">{label}</span>
      <span className="font-semibold text-gray-900 capitalize">{value}</span>
    </div>
  );
}
