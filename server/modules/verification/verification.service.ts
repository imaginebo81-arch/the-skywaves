import { supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";
import { getStudentResult } from "../marks/marks.service";
import { signResultToken } from "../../lib/tokens";
import { defaultSiteContent } from "../../../src/data/siteContent";
import { getMergedContent } from "../content/content.service";

export async function verifyStudent(rollNumber: string, dateOfBirth: string) {
  const { data, error } = await supabase
    .from("students")
    .select("roll_number")
    .eq("roll_number", rollNumber)
    .eq("date_of_birth", dateOfBirth)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw ApiError.internal("Verification failed");
  if (!data) throw ApiError.notFound("No matching student record found. Please check the details and try again.");

  const result = await getStudentResult(rollNumber);
  return { ...result, resultToken: signResultToken(rollNumber) };
}

export async function getResultByToken(rollNumber: string) {
  return getStudentResult(rollNumber);
}

function applyTemplate(template: string, vars: Record<string, unknown>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) => {
    const value = vars[key];
    return value == null || value === "" ? "____" : String(value);
  });
}

function formatDate(value: string | null): string {
  if (!value) return "Present";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export async function verifyEmployee(referenceNumber: string, dateOfBirth: string) {
  const { data, error } = await supabase
    .from("employees")
    .select("employment_reference_number, name, father_name, date_of_birth, address, joining_date, leaving_date, designation, certificate_template_variables")
    .eq("employment_reference_number", referenceNumber)
    .eq("date_of_birth", dateOfBirth)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw ApiError.internal("Verification failed");
  if (!data) throw ApiError.notFound("No matching employment record found. Please check the details and try again.");

  let template = defaultSiteContent.verification.employee.certificateTemplate;
  try {
    const content = await getMergedContent();
    template = content.verification.employee.certificateTemplate;
  } catch {
    // fall back to default template
  }

  const vars = {
    name: data.name,
    designation: data.designation,
    joiningDate: formatDate(data.joining_date),
    leavingDate: formatDate(data.leaving_date),
    ...(data.certificate_template_variables as Record<string, unknown>),
  };

  return {
    employee: {
      employmentReferenceNumber: data.employment_reference_number,
      name: data.name,
      fatherName: data.father_name,
      dateOfBirth: data.date_of_birth,
      address: data.address,
      joiningDate: data.joining_date,
      leavingDate: data.leaving_date,
      designation: data.designation,
      isCurrentlyWorking: !data.leaving_date,
    },
    certificateText: applyTemplate(template, vars),
  };
}
