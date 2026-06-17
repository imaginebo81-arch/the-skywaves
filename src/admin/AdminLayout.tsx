import { useState, useEffect, useRef, type ReactNode } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ListChecks,
  ClipboardList,
  GraduationCap,
  FileSpreadsheet,
  Users,
  Settings as SettingsIcon,
  ScrollText,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Star,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { useAdminAuth } from "./AdminAuthContext";
import { useContent } from "../context/ContentContext";
import { adminApi } from "../lib/api/admin";

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
  { to: "/admin/feedbacks", label: "Feedbacks", icon: MessageSquare },
  { to: "/admin/testimonials", label: "Testimonials", icon: Star },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
];

interface NotificationItem {
  id: string;
  type: "enquiry" | "feedback";
  name: string;
  source: string | null;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { admin, logout } = useAdminAuth();
  const { meta } = useContent();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [notifCount, setNotifCount] = useState(0);
  const [notifItems, setNotifItems] = useState<NotificationItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    adminApi
      .getNotifications()
      .then((res) => {
        setNotifCount(res.count);
        setNotifItems(res.items);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAllRead = async () => {
    await adminApi.markAllNotificationsRead().catch(() => {});
    fetchNotifications();
    setNotifOpen(false);
  };

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
            {/* Notifications bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <Bell size={20} />
                {notifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="font-semibold text-sm text-gray-900">Notifications</span>
                    {notifCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-[#eaa320] hover:underline cursor-pointer">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifItems.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">No new notifications</p>
                    ) : (
                      notifItems.map((n) => (
                        <Link
                          key={`${n.type}-${n.id}`}
                          to={n.type === "enquiry" ? "/admin/enquiries" : "/admin/feedbacks"}
                          onClick={() => setNotifOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                            {n.type === "enquiry" ? <MessageSquare size={14} className="text-orange-600" /> : <Star size={14} className="text-orange-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{n.name}</p>
                            <p className="text-xs text-gray-500">
                              {n.type === "enquiry" ? `${n.source === "contact" ? "Contact" : "Enquiry"} form` : "Feedback submission"}
                              {" · "}{timeAgo(n.createdAt)}
                            </p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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
