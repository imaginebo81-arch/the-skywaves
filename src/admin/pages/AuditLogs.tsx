import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { adminApi } from "../../lib/api/admin";
import { PageHeader, Spinner, ErrorBanner, Button } from "../components/ui";
import { formatDateTime } from "../../lib/dateUtils";

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState("");
  const { data, loading, error } = useApi(
    () => adminApi.auditLogs({ page, pageSize: 30, entity: entity || undefined }),
    [page, entity]
  );

  const inputClass = "rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none text-sm focus:border-[#eaa320]";

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Track every administrative action" />

      <div className="mb-4 flex gap-3">
        <select className={inputClass} value={entity} onChange={(e) => { setEntity(e.target.value); setPage(1); }}>
          <option value="">All entities</option>
          <option value="verification">Verification</option>
          <option value="enquiries">Enquiries</option>
          <option value="feedbacks">Feedbacks</option>
          <option value="registrations">Registrations</option>
          <option value="students">Students</option>
          <option value="student_marks">Student Marks</option>
          <option value="employees">Employees</option>
          <option value="courses">Courses</option>
          <option value="subjects">Subjects</option>
          <option value="site_content">Website Content</option>
          <option value="settings">Settings</option>
          <option value="admin_users">Admin Users (Auth)</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorBanner message={error} />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Actor</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                  <th className="px-4 py-3 font-semibold">Entity</th>
                  <th className="px-4 py-3 font-semibold">Entity ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.items.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-700">{log.actor}</td>
                    <td className="px-4 py-3"><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{log.action}</span></td>
                    <td className="px-4 py-3 text-gray-600">{log.entity}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-[200px] truncate">{log.entityId ?? "-"}</td>
                  </tr>
                ))}
                {data?.items.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No audit logs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">Page {data.page} of {data.totalPages}</p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
                <Button variant="secondary" onClick={() => setPage((p) => p + 1)} disabled={page >= data.totalPages}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
