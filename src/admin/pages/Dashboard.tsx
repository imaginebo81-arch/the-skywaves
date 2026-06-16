import { Link } from "react-router-dom";
import { GraduationCap, Users, BookOpen, ListChecks, ClipboardList, Clock } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { adminApi } from "../../lib/api/admin";
import { PageHeader, Spinner, ErrorBanner, StatusBadge } from "../components/ui";

const CARDS = [
  { key: "students", label: "Students", icon: GraduationCap, to: "/admin/students" },
  { key: "employees", label: "Employees", icon: Users, to: "/admin/employees" },
  { key: "courses", label: "Courses", icon: BookOpen, to: "/admin/courses" },
  { key: "subjects", label: "Subjects", icon: ListChecks, to: "/admin/subjects" },
  { key: "pendingRegistrations", label: "Pending Registrations", icon: Clock, to: "/admin/registrations" },
  { key: "totalRegistrations", label: "Total Registrations", icon: ClipboardList, to: "/admin/registrations" },
] as const;

export default function Dashboard() {
  const { data, loading, error } = useApi(() => adminApi.dashboard(), []);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!data) return null;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your institution" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {CARDS.map((card) => (
          <Link key={card.key} to={card.to} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{data.stats[card.key]}</p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                <card.icon className="text-[#eaa320]" size={22} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Registrations</h2>
        {data.recentRegistrations.length === 0 ? (
          <p className="text-gray-500 text-sm">No registrations yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.recentRegistrations.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.admission_number}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
