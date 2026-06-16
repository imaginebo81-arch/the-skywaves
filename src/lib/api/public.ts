import { api } from "./client";
import type { SiteContent } from "../../data/siteContent";
import type {
  EmployeeVerification,
  PublicCourse,
  RegistrationResult,
  StudentResult,
} from "./types";

export const publicApi = {
  getContent: () => api.get<{ content: SiteContent }>("/public/content"),

  getCourses: () => api.get<{ courses: PublicCourse[] }>("/public/courses"),

  uploadProfilePhoto: (file: File) => {
    const form = new FormData();
    form.append("photo", file);
    return api.post<{ path: string }>("/public/uploads/profile-photo", form);
  },

  createRegistration: (input: {
    name: string;
    fatherName?: string;
    motherName?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    contactNumber: string;
    courseId?: string;
    profilePhotoPath?: string;
  }) => api.post<RegistrationResult>("/public/registrations", input),

  verifyStudent: (rollNumber: string, dateOfBirth: string) =>
    api.post<StudentResult>("/public/verify/student", { rollNumber, dateOfBirth }),

  verifyEmployee: (employmentReferenceNumber: string, dateOfBirth: string) =>
    api.post<EmployeeVerification>("/public/verify/employee", {
      employmentReferenceNumber,
      dateOfBirth,
    }),

  getResultByToken: (token: string) =>
    api.get<StudentResult>("/public/verify/result", { token }),

  submitEnquiry: (input: {
    name: string;
    email?: string;
    phone?: string;
    course?: string;
    message?: string;
    source: "enquiry" | "contact";
  }) => api.post<{ success: boolean }>("/public/enquiries", input),
};
