import { Router } from "express";
import { z } from "zod";
import { asyncHandler, ok } from "../../lib/http";
import { validate } from "../../middleware/validate";
import { ApiError } from "../../lib/errors";
import { verifyResultToken } from "../../lib/tokens";
import { getResultByToken, verifyEmployee, verifyStudent } from "./verification.service";
import { writeAudit } from "../../lib/audit";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const studentSchema = z.object({
  rollNumber: z.string().trim().min(1).max(60),
  dateOfBirth: dateStr,
});

const employeeSchema = z.object({
  employmentReferenceNumber: z.string().trim().min(1).max(60),
  dateOfBirth: dateStr,
});

export const publicVerificationRouter = Router();

publicVerificationRouter.post(
  "/student",
  validate(studentSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof studentSchema>;
    try {
      const result = await verifyStudent(body.rollNumber, body.dateOfBirth);
      await writeAudit({ actorId: "public", action: "public.verify_student", entity: "verification", entityId: body.rollNumber.toUpperCase().trim(), newValue: { success: true } });
      ok(res, result);
    } catch (err) {
      await writeAudit({ actorId: "public", action: "public.verify_student", entity: "verification", entityId: body.rollNumber.toUpperCase().trim(), newValue: { success: false, message: err instanceof Error ? err.message : "Not found" } }).catch(() => {});
      throw err;
    }
  })
);

publicVerificationRouter.post(
  "/employee",
  validate(employeeSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof employeeSchema>;
    try {
      const result = await verifyEmployee(body.employmentReferenceNumber, body.dateOfBirth);
      await writeAudit({ actorId: "public", action: "public.verify_employee", entity: "verification", entityId: body.employmentReferenceNumber.toUpperCase().trim(), newValue: { success: true } });
      ok(res, result);
    } catch (err) {
      await writeAudit({ actorId: "public", action: "public.verify_employee", entity: "verification", entityId: body.employmentReferenceNumber.toUpperCase().trim(), newValue: { success: false, message: err instanceof Error ? err.message : "Not found" } }).catch(() => {});
      throw err;
    }
  })
);

publicVerificationRouter.get(
  "/result",
  asyncHandler(async (req, res) => {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    let rollNumber: string;
    try {
      rollNumber = verifyResultToken(token).rollNumber;
    } catch {
      throw ApiError.unauthorized("This result link has expired. Please verify again.");
    }
    ok(res, await getResultByToken(rollNumber));
  })
);
