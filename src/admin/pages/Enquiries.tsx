import { useState, type MouseEvent } from "react";
import { Trash2, CheckCheck, Eye } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { adminApi } from "../../lib/api/admin";
import { PageHeader, Spinner, ErrorBanner, Button, ConfirmDialog } from "../components/ui";
import { formatDateTime } from "../../lib/dateUtils";

interface Enquiry {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  course: string | null;
  message: string | null;
  source: "enquiry" | "contact";
  status: "new" | "read" | "resolved";
  created_at: string;
}

type SourceFilter = "all" | "enquiry" | "contact";
type StatusFilter = "all" | "new" | "read" | "resolved";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-orange-100 text-orange-700",
  read: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

const SOURCE_COLORS: Record<string, string> = {
  enquiry: "bg-purple-100 text-purple-700",
  contact: "bg-teal-100 text-teal-700",
};

export default function Enquiries() {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("new");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Enquiry | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data, loading, error, reload } = useApi(
    () => adminApi.list<Enquiry>("enquiries", { pageSize: 100 }),
    []
  );

  const items = (data?.items ?? []).filter((e) => {
    const matchSource = sourceFilter === "all" || e.source === sourceFilter;
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSource && matchStatus;
  });

  const counts = {
    new: (data?.items ?? []).filter((e) => e.status === "new").length,
    all: (data?.items ?? []).length,
  };

  const markStatus = async (id: string, status: "read" | "resolved", e: MouseEvent) => {
    e.stopPropagation();
    setActionLoading(id + status);
    try {
      await adminApi.update("enquiries", id, { status });
      reload();
    } finally {
      setActionLoading(null);
    }
  };

  const runDelete = async () => {
    if (!confirmDelete) return;
    await adminApi.remove("enquiries", confirmDelete.id).catch(() => {});
    setConfirmDelete(null);
    reload();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Enquiries"
        subtitle={`Contact form & enquiry submissions${counts.new > 0 ? ` · ${counts.new} unread` : ""}`}
      />

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {(["all", "new", "read", "resolved"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer capitalize ${statusFilter === s ? "bg-[#eaa320] text-gray-900" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {(["all", "contact", "enquiry"] as SourceFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer capitalize ${sourceFilter === s ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {s === "all" ? "All Sources" : s === "contact" ? "Contact Form" : "Enquiry Form"}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500 ml-auto">{items.length} result{items.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Course</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((e) => (
              <>
                <tr
                  key={e.id}
                  onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${e.status === "new" ? "bg-orange-50/40" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {e.status === "new" && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />}
                      <span className="font-medium text-gray-900">{e.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex flex-col gap-0.5">
                      {e.email && <span className="text-xs">{e.email}</span>}
                      {e.phone && <span className="text-xs text-gray-400">{e.phone}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px]">
                    <span className="line-clamp-1">{e.course ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SOURCE_COLORS[e.source]}`}>
                      {e.source === "contact" ? "Contact" : "Enquiry"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[e.status]}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDateTime(e.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1" onClick={(ev) => ev.stopPropagation()}>
                      <Button variant="ghost" title="View" onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}>
                        <Eye size={15} />
                      </Button>
                      {e.status !== "resolved" && (
                        <Button
                          variant="ghost"
                          title="Mark resolved"
                          disabled={actionLoading === e.id + "resolved"}
                          onClick={(ev) => { void markStatus(e.id, "resolved", ev); }}
                        >
                          <CheckCheck size={15} className="text-green-600" />
                        </Button>
                      )}
                      <Button variant="ghost" onClick={() => setConfirmDelete(e)}>
                        <Trash2 size={15} className="text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
                {expandedId === e.id && (
                  <tr key={`${e.id}-expand`} className="bg-gray-50">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{e.message ?? "No message provided."}</p>
                        {e.status === "new" && (
                          <button
                            onClick={(ev) => markStatus(e.id, "read", ev)}
                            className="self-start mt-1 text-xs text-blue-600 hover:underline cursor-pointer"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  No enquiries match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Enquiry"
        message={`Delete the enquiry from "${confirmDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={runDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
