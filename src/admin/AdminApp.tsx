import { Navigate, Route, Routes } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "./AdminAuthContext";
import AdminLayout from "./AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Subjects from "./pages/Subjects";
import Registrations from "./pages/Registrations";
import Students from "./pages/Students";
import StudentMarks from "./pages/StudentMarks";
import Employees from "./pages/Employees";
import Enquiries from "./pages/Enquiries";
import Feedbacks from "./pages/Feedbacks";
import TestimonialsAdmin from "./pages/TestimonialsAdmin";
import SettingsPage from "./pages/Settings";
import AuditLogs from "./pages/AuditLogs";
import { Spinner } from "./components/ui";

function ProtectedRoutes() {
  const { admin, loading } = useAdminAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    );
  }
  if (!admin) return <Navigate to="/admin/login" replace />;

  return (
    <AdminLayout>
      <Routes>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/courses" element={<Courses />} />
        <Route path="/admin/subjects" element={<Subjects />} />
        <Route path="/admin/registrations" element={<Registrations />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path="/admin/marks" element={<StudentMarks />} />
        <Route path="/admin/employees" element={<Employees />} />
        <Route path="/admin/enquiries" element={<Enquiries />} />
        <Route path="/admin/feedbacks" element={<Feedbacks />} />
        <Route path="/admin/testimonials" element={<TestimonialsAdmin />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="*" element={<ProtectedRoutes />} />
      </Routes>
    </AdminAuthProvider>
  );
}
