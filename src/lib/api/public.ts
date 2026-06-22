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

  uploadFeedbackPhoto: (file: File) => {
    const form = new FormData();
    form.append("photo", file);
    return api.post<{ path: string }>("/public/uploads/feedback-photo", form);
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

  submitFeedback: (input: {
    name: string;
    profession?: string;
    review: string;
    profile_photo_path?: string;
  }) => api.post<{ success: boolean }>("/public/feedbacks", input),

  getTestimonials: () =>
    api.get<{ items: { id: string; name: string; role: string | null; quote: string; image_url: string | null }[] }>(
      "/public/testimonials"
    ),

  getCoursesCatalog: () =>
    api.get<{
      courses: {
        id: string;
        courseName: string;
        description: string | null;
        imageUrl: string | null;
        duration: string | null;
        groupId: string;
        groupName: string;
      }[];
    }>("/public/courses/catalog"),

  getCourseGroups: () =>
    api.get<{
      groups: { id: string; name: string; description: string | null; imageUrl: string | null }[];
    }>("/public/course-groups"),

  getSocialLinks: () =>
    api.get<{ facebook: string; instagram: string; youtube: string; twitter: string; linkedin: string }>(
      "/public/settings/social-links"
    ),
};
