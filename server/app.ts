import { Router } from "express";
import { publicRateLimit } from "./middleware/rateLimit";
import { notFoundHandler } from "./middleware/errorHandler";

import authRouter from "./modules/auth/auth.routes";
import { publicContentRouter, adminContentRouter } from "./modules/content/content.routes";
import { publicCoursesRouter, adminCoursesRouter } from "./modules/courses/courses.routes";
import { adminSubjectsRouter } from "./modules/subjects/subjects.routes";
import { publicRegistrationsRouter, adminRegistrationsRouter } from "./modules/registrations/registrations.routes";
import { adminStudentsRouter } from "./modules/students/students.routes";
import { adminEmployeesRouter } from "./modules/employees/employees.routes";
import { publicVerificationRouter } from "./modules/verification/verification.routes";
import { publicUploadsRouter } from "./modules/storage/storage.routes";
import { publicEnquiriesRouter, adminEnquiriesRouter } from "./modules/enquiries/enquiries.routes";
import { adminSettingsRouter } from "./modules/settings/settings.routes";
import { adminAuditRouter } from "./modules/audit/audit.routes";
import { adminDashboardRouter } from "./modules/dashboard/dashboard.routes";
import { adminUsersRouter } from "./modules/adminUsers/adminUsers.routes";
import { adminMarksRouter } from "./modules/marks/marks.routes";

export function buildApiRouter(): Router {
  const api = Router();

  api.get("/health", (_req, res) => res.json({ status: "ok" }));

  // Public surface (rate-limited)
  const pub = Router();
  pub.use(publicRateLimit);
  pub.use("/content", publicContentRouter);
  pub.use("/courses", publicCoursesRouter);
  pub.use("/registrations", publicRegistrationsRouter);
  pub.use("/uploads", publicUploadsRouter);
  pub.use("/verify", publicVerificationRouter);
  pub.use("/enquiries", publicEnquiriesRouter);
  api.use("/public", pub);

  // Auth
  api.use("/auth", authRouter);

  // Admin surface (each router enforces requireAdmin internally)
  const admin = Router();
  admin.use("/dashboard", adminDashboardRouter);
  admin.use("/content", adminContentRouter);
  admin.use("/courses", adminCoursesRouter);
  admin.use("/subjects", adminSubjectsRouter);
  admin.use("/registrations", adminRegistrationsRouter);
  admin.use("/students", adminStudentsRouter);
  admin.use("/employees", adminEmployeesRouter);
  admin.use("/settings", adminSettingsRouter);
  admin.use("/enquiries", adminEnquiriesRouter);
  admin.use("/marks", adminMarksRouter);
  admin.use("/audit-logs", adminAuditRouter);
  admin.use("/admin-users", adminUsersRouter);
  api.use("/admin", admin);

  api.use(notFoundHandler);
  return api;
}
