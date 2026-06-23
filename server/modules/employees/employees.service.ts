import { createCrud } from "../../lib/crud";
import { signedPhotoUrl } from "../storage/storage.service";

export interface EmployeeDto {
  employmentReferenceNumber: string;
  name: string;
  fatherName: string | null;
  dateOfBirth: string;
  address: string | null;
  joiningDate: string | null;
  leavingDate: string | null;
  designation: string | null;
  certificateTemplateVariables: Record<string, unknown>;
  certificateMarkdown: string | null;
  profilePhotoPath: string | null;
  status: string;
  createdAt: string;
  deletedAt: string | null;
  archivedAt: string | null;
}

const SELECT =
  "employment_reference_number, name, father_name, date_of_birth, address, joining_date, leaving_date, designation, certificate_template_variables, certificate_markdown, profile_photo_path, status, created_at, updated_at, deleted_at, archived_at";

function toDto(row: Record<string, unknown>): EmployeeDto {
  return {
    employmentReferenceNumber: row.employment_reference_number as string,
    name: row.name as string,
    fatherName: (row.father_name as string) ?? null,
    dateOfBirth: row.date_of_birth as string,
    address: (row.address as string) ?? null,
    joiningDate: (row.joining_date as string) ?? null,
    leavingDate: (row.leaving_date as string) ?? null,
    designation: (row.designation as string) ?? null,
    certificateTemplateVariables: (row.certificate_template_variables as Record<string, unknown>) ?? {},
    certificateMarkdown: (row.certificate_markdown as string) ?? null,
    profilePhotoPath: (row.profile_photo_path as string) ?? null,
    status: row.status as string,
    createdAt: row.created_at as string,
    deletedAt: (row.deleted_at as string) ?? null,
    archivedAt: (row.archived_at as string) ?? null,
  };
}

export const employeesCrud = createCrud<EmployeeDto>({
  table: "employees",
  entity: "employee",
  pk: "employment_reference_number",
  selectColumns: SELECT,
  searchColumns: ["name", "employment_reference_number", "designation"],
  toDto,
});

export async function signEmployeePhoto(dto: EmployeeDto) {
  return { ...dto, profilePhotoUrl: await signedPhotoUrl(dto.profilePhotoPath) };
}

const UPPERCASE_COLUMNS = new Set(["employment_reference_number", "name", "father_name"]);

export function toEmployeeRow(input: Record<string, unknown>) {
  const map: Record<string, string> = {
    employmentReferenceNumber: "employment_reference_number",
    name: "name",
    fatherName: "father_name",
    dateOfBirth: "date_of_birth",
    address: "address",
    joiningDate: "joining_date",
    leavingDate: "leaving_date",
    designation: "designation",
    certificateTemplateVariables: "certificate_template_variables",
    certificateMarkdown: "certificate_markdown",
    profilePhotoPath: "profile_photo_path",
    status: "status",
  };
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (!map[k]) continue;
    const col = map[k];
    row[col] = UPPERCASE_COLUMNS.has(col) && typeof v === "string" ? v.trim().replace(/\s+/g, " ").toUpperCase() : v;
  }
  return row;
}
