import { api } from "./client";
import type { AdminProfile, Paginated } from "./types";

type ListParams = Record<string, string | number | boolean | undefined>;

export const adminApi = {
  login: (username: string, password: string) =>
    api.post<{ admin: AdminProfile }>("/auth/login", { username, password }),
  logout: () => api.post<{ success: boolean }>("/auth/logout"),
  me: () => api.get<{ admin: AdminProfile }>("/auth/me"),

  dashboard: () =>
    api.get<{
      stats: {
        students: number;
        employees: number;
        courses: number;
        subjects: number;
        pendingRegistrations: number;
        totalRegistrations: number;
      };
      recentRegistrations: { id: string; name: string; admission_number: string; status: string; created_at: string }[];
    }>("/admin/dashboard/stats"),

  // Generic helpers for resource modules
  list: <T>(resource: string, params?: ListParams) =>
    api.get<Paginated<T>>(`/admin/${resource}`, params),
  get: <T>(resource: string, id: string) => api.get<T>(`/admin/${resource}/${id}`),
  create: <T>(resource: string, body: unknown) => api.post<T>(`/admin/${resource}`, body),
  update: <T>(resource: string, id: string, body: unknown) =>
    api.patch<T>(`/admin/${resource}/${id}`, body),
  remove: (resource: string, id: string) => api.del(`/admin/${resource}/${id}`),
  restore: (resource: string, id: string) => api.post(`/admin/${resource}/${id}/restore`),
  archive: (resource: string, id: string) => api.post(`/admin/${resource}/${id}/archive`),
  unarchive: (resource: string, id: string) => api.post(`/admin/${resource}/${id}/unarchive`),

  // Subjects (filtered by course)
  subjectsByCourse: <T>(courseId: string, includeArchived = false) =>
    api.get<{ items: T[] }>("/admin/subjects", { courseId, includeArchived }),

  // Registrations
  approveRegistration: (id: string, rollNumber: string, startDate?: string, endDate?: string) =>
    api.post(`/admin/registrations/${id}/approve`, { rollNumber, startDate, endDate }),
  rejectRegistration: (id: string) => api.post(`/admin/registrations/${id}/reject`),

  // Marks
  getStudentMarks: <T>(rollNumber: string) =>
    api.get<T>(`/admin/students/${rollNumber}/marks`),
  saveStudentMarks: <T>(rollNumber: string, marks: { subjectId: string; obtainedMarks: number | null }[]) =>
    api.put<T>(`/admin/students/${rollNumber}/marks`, { marks }),
  getStudentResult: <T>(rollNumber: string) =>
    api.get<T>(`/admin/students/${rollNumber}/result`),
  getResultToken: (rollNumber: string) =>
    api.get<{ token: string }>(`/admin/students/${rollNumber}/result-token`),

  // Marks (flat admin list)
  listAllMarks: (params?: ListParams) =>
    api.get<Paginated<{
      markId: string; rollNumber: string; studentName: string;
      courseId: string; courseName: string | null; subjectName: string;
      minMarks: number; maxMarks: number; obtainedMarks: number | null;
    }>>("/admin/marks", params),
  deleteMark: (markId: string) => api.del(`/admin/marks/${markId}`),
  bulkUpdateMarks: (entries: { rollNumber: string; subjectName: string; obtainedMarks: number | null }[]) =>
    api.post<{ ok: number; fail: number }>("/admin/marks/bulk", { entries }),

  // Content
  listContentKeys: () =>
    api.get<{ keys: { key: string; isDefault: boolean; updatedAt: string | null }[] }>("/admin/content"),
  getContent: (key: string) =>
    api.get<{ key: string; data: unknown; isDefault: boolean; updatedAt: string | null }>(`/admin/content/${key}`),
  saveContent: (key: string, data: unknown) => api.put(`/admin/content/${key}`, { data }),
  restoreContent: (key: string) => api.post(`/admin/content/${key}/restore`),

  // Settings
  listSettings: () =>
    api.get<{ settings: { key: string; value: unknown; updated_at: string }[] }>("/admin/settings"),
  saveSetting: (key: string, value: unknown) => api.put(`/admin/settings/${key}`, { value }),

  // Audit
  auditLogs: (params?: ListParams) =>
    api.get<Paginated<{ id: string; action: string; entity: string; entityId: string | null; prevValue: unknown; newValue: unknown; createdAt: string; actor: string }>>(
      "/admin/audit-logs",
      params
    ),

  // Admin users
  listAdminUsers: () => api.get<{ items: AdminProfile[] }>("/admin/admin-users"),
  createAdminUser: (body: unknown) => api.post("/admin/admin-users", body),
  updateAdminUser: (id: string, body: unknown) => api.patch(`/admin/admin-users/${id}`, body),
  removeAdminUser: (id: string) => api.del(`/admin/admin-users/${id}`),
};
