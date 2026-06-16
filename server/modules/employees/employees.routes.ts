import { z } from "zod";
import { buildCrudRouter } from "../../lib/crudRouter";
import { employeesCrud, toEmployeeRow } from "./employees.service";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const createSchema = z.object({
  employmentReferenceNumber: z.string().trim().min(1).max(60),
  name: z.string().trim().min(1).max(200),
  fatherName: z.string().trim().max(200).optional().nullable(),
  dateOfBirth: dateStr,
  address: z.string().trim().max(500).optional().nullable(),
  joiningDate: dateStr.optional().nullable(),
  leavingDate: dateStr.optional().nullable(),
  designation: z.string().trim().max(200).optional().nullable(),
  certificateTemplateVariables: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

const updateSchema = createSchema.partial().omit({ employmentReferenceNumber: true });

export const adminEmployeesRouter = buildCrudRouter({
  crud: employeesCrud,
  createSchema,
  updateSchema,
  toRow: (input) => toEmployeeRow(input),
});
