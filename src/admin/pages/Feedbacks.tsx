import { useState } from "react";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { adminApi } from "../../lib/api/admin";
import { PageHeader, Spinner, ErrorBanner, Button, ConfirmDialog, StatusBadge } from "../components/ui";

interface Feedback {
  id: string;
  name: string;
  profession: string | null;
  review: string;
  status: string;
  created_at: string;
  deleted_at: string | null;
}

export default function Feedbacks() {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const { data, loading, error, reload } = useApi(
    () => adminApi.list<Feedback>("feedbacks", { status: statusFilter, pageSize: 50 }),
    [statusFilter]
  );
  const [confirm, setConfirm] = useState<{ action: "approve" | "reject" | "delete"; item: Feedback } | null>(null);
  const [acting, setActing] = useState(false);

  const runConfirm = async () => {
    if (!confirm) return;
    setActing(true);
    try {
      const { action, item } = confirm;
      if (action === "delete") {
        await adminApi.remove("feedbacks", item.id);
      } else {
        await adminApi.update("feedbacks", item.id, { status: action === "approve" ? "approved" : "rejected" });
      }
      setConfirm(null);
      reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActing(false);
    }
  };

  const items = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Feedbacks"
        subtitle="User-submitted reviews awaiting approval"
      />

      <div className="flex gap-2 mb-4">
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize cursor-pointer transition-colors ${
              statusFilter === s ? "bg-[#eaa320] text-gray-900" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
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
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Profession</th>
                <th className="px-4 py-3 font-semibold">Review</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((fb) => (
                <tr key={fb.id}>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{fb.name}</td>
                  <td className="px-4 py-3 text-gray-600">{fb.profession ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <p className="line-clamp-2">{fb.review}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={fb.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                    {new Date(fb.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {fb.status === "pending" && (
                        <>
                          <Button variant="ghost" onClick={() => setConfirm({ action: "approve", item: fb })}>
                            <CheckCircle size={16} className="text-green-600" />
                          </Button>
                          <Button variant="ghost" onClick={() => setConfirm({ action: "reject", item: fb })}>
                            <XCircle size={16} className="text-red-500" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" onClick={() => setConfirm({ action: "delete", item: fb })}>
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    No {statusFilter} feedbacks.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={
          confirm?.action === "approve"
            ? "Approve Feedback"
            : confirm?.action === "reject"
            ? "Reject Feedback"
            : "Delete Feedback"
        }
        message={
          confirm?.action === "approve"
            ? "This will approve the review and publish it as a testimonial on the website."
            : confirm?.action === "reject"
            ? "This will reject the review. It will not appear on the website."
            : "This will permanently remove this feedback."
        }
        confirmLabel={confirm?.action === "approve" ? "Approve" : confirm?.action === "reject" ? "Reject" : "Delete"}
        destructive={confirm?.action !== "approve"}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
