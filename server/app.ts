import { Router } from "express";
import { publicRateLimit } from "./middleware/rateLimit";
import { notFoundHandler } from "./middleware/errorHandler";
import { requireAdmin } from "./middleware/auth";
import { asyncHandler, ok } from "./lib/http";
import { ApiError } from "./lib/errors";

import authRouter from "./modules/auth/auth.routes";
import { publicContentRouter, adminContentRouter } from "./modules/content/content.routes";
import { publicCoursesRouter, adminCoursesRouter } from "./modules/courses/courses.routes";
import { publicCourseGroupsRouter, adminCourseGroupsRouter } from "./modules/courseGroups/courseGroups.routes";
import { adminSubjectsRouter } from "./modules/subjects/subjects.routes";
import { publicRegistrationsRouter, adminRegistrationsRouter } from "./modules/registrations/registrations.routes";
import { adminStudentsRouter } from "./modules/students/students.routes";
import { adminEmployeesRouter } from "./modules/employees/employees.routes";
import { publicVerificationRouter } from "./modules/verification/verification.routes";
import { publicUploadsRouter, adminUploadsRouter } from "./modules/storage/storage.routes";
import { publicEnquiriesRouter, adminEnquiriesRouter } from "./modules/enquiries/enquiries.routes";
import { publicFeedbacksRouter, adminFeedbacksRouter } from "./modules/feedbacks/feedbacks.routes";
import { publicTestimonialsRouter, adminTestimonialsRouter } from "./modules/testimonials/testimonials.routes";
import { adminSettingsRouter, publicSettingsRouter } from "./modules/settings/settings.routes";
import { adminAuditRouter } from "./modules/audit/audit.routes";
import { adminDashboardRouter } from "./modules/dashboard/dashboard.routes";
import { adminUsersRouter } from "./modules/adminUsers/adminUsers.routes";
import { adminMarksRouter } from "./modules/marks/marks.routes";
import { supabase } from "./supabase";

export function buildApiRouter(): Router {
  const api = Router();

  api.get("/health", (_req, res) => res.json({ status: "ok" }));

  // Public surface (rate-limited)
  const pub = Router();
  pub.use(publicRateLimit);
  pub.use("/content", publicContentRouter);
  pub.use("/courses", publicCoursesRouter);
  pub.use("/course-groups", publicCourseGroupsRouter);
  pub.use("/registrations", publicRegistrationsRouter);
  pub.use("/uploads", publicUploadsRouter);
  pub.use("/verify", publicVerificationRouter);
  pub.use("/enquiries", publicEnquiriesRouter);
  pub.use("/feedbacks", publicFeedbacksRouter);
  pub.use("/testimonials", publicTestimonialsRouter);
  pub.use("/settings", publicSettingsRouter);
  api.use("/public", pub);

  // Auth
  api.use("/auth", authRouter);

  // Admin surface
  const admin = Router();
  admin.use("/dashboard", adminDashboardRouter);
  admin.use("/content", adminContentRouter);
  admin.use("/courses", adminCoursesRouter);
  admin.use("/course-groups", adminCourseGroupsRouter);
  admin.use("/subjects", adminSubjectsRouter);
  admin.use("/registrations", adminRegistrationsRouter);
  admin.use("/students", adminStudentsRouter);
  admin.use("/employees", adminEmployeesRouter);
  admin.use("/settings", adminSettingsRouter);
  admin.use("/enquiries", adminEnquiriesRouter);
  admin.use("/feedbacks", adminFeedbacksRouter);
  admin.use("/testimonials", adminTestimonialsRouter);
  admin.use("/marks", adminMarksRouter);
  admin.use("/audit-logs", adminAuditRouter);
  admin.use("/admin-users", adminUsersRouter);
  admin.use("/uploads", adminUploadsRouter);

  admin.get(
    "/notifications",
    requireAdmin,
    asyncHandler(async (_req, res) => {
      const [enqResult, fbResult] = await Promise.allSettled([
        supabase
          .from("enquiries")
          .select("id, name, source, created_at")
          .eq("status", "new")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("feedbacks")
          .select("id, name, created_at")
          .eq("status", "pending")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      const enq = enqResult.status === "fulfilled" ? (enqResult.value.data ?? []) : [];
      const fb = fbResult.status === "fulfilled" ? (fbResult.value.data ?? []) : [];

      const items = [
        ...enq.map((e) => ({ id: e.id, type: "enquiry" as const, name: e.name, source: e.source, createdAt: e.created_at })),
        ...fb.map((f) => ({ id: f.id, type: "feedback" as const, name: f.name, source: null, createdAt: f.created_at })),
      ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20);

      ok(res, { count: items.length, items });
    })
  );

  admin.patch(
    "/notifications/read-all",
    requireAdmin,
    asyncHandler(async (_req, res) => {
      await supabase.from("enquiries").update({ status: "read" }).eq("status", "new").is("deleted_at", null);
      ok(res, { success: true });
    })
  );

  api.use("/admin", admin);

  api.use(notFoundHandler);
  return api;
}
