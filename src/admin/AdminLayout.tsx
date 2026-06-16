import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ListChecks,
  ClipboardList,
  GraduationCap,
  FileSpreadsheet,
  Users,
  Globe,
  Settings as SettingsIcon,
  ScrollText,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAdminAuth } from "./AdminAuthContext";
import { useContent } from "../context/ContentContext";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/subjects", label: "Subjects", icon: ListChecks },
  { to: "/admin/registrations", label: "Registrations", icon: ClipboardList },
  { to: "/admin/students", label: "Students", icon: GraduationCap },
  { to: "/admin/marks", label: "Student Marks", icon: FileSpreadsheet },
  { to: "/admin/employees", label: "Employees", icon: Users },
  { to: "/admin/content", label: "Website Content", icon: Globe },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { admin, logout } = useAdminAuth();
  const { meta } = useContent();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 bg-dark text-white flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-[72px] flex items-center gap-3 px-6 border-b border-white/10">
          <img src={meta.logoUrl} alt={meta.orgName} className="h-8 object-contain" />
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? "bg-[#eaa320] text-gray-900" : "text-gray-300 hover:bg-white/10 hover:translate-x-1"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 w-full cursor-pointer">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
          <button className="lg:hidden text-gray-700 cursor-pointer" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{admin?.displayName || admin?.username}</p>
              <p className="text-xs text-gray-500 capitalize">{admin?.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#eaa320] text-gray-900 flex items-center justify-center font-bold">
              {(admin?.displayName || admin?.username || "A").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
