export interface PublicCourse {
  id: string;
  courseName: string;
  duration: string | null;
}

export interface RegistrationResult {
  id: string;
  admissionNumber: string;
  admissionDate: string;
}

export interface ResultMark {
  subjectName: string;
  obtainedMarks: number | null;
  grade: string | null;
  minMarks: number;
  maxMarks: number;
}

export interface ResultSummary {
  totalObtained: number;
  totalMax: number;
  percentage: number;
  passed: boolean;
  failedSubjects: string[];
  hasPendingMarks: boolean;
  passPercentage: number;
  grade: string;
}

export interface StudentResult {
  student: {
    rollNumber: string;
    name: string;
    fatherName: string | null;
    motherName: string | null;
    dateOfBirth: string | null;
    courseName: string | null;
    startDate: string | null;
    endDate: string | null;
    profilePhotoUrl?: string | null;
  };
  marks: ResultMark[];
  summary: ResultSummary;
  resultType?: "marksheet" | "gradecard" | "pending";
  studentGrade?: string | null;
  resultToken?: string;
}

export interface EmployeeVerification {
  employee: {
    employmentReferenceNumber: string;
    name: string;
    fatherName: string | null;
    dateOfBirth: string;
    address: string | null;
    joiningDate: string | null;
    leavingDate: string | null;
    designation: string | null;
    isCurrentlyWorking: boolean;
    profilePhotoUrl: string | null;
  };
  certificateText: string;
  certificateMarkdown: string | null;
}

export interface AdminProfile {
  id: string;
  username: string;
  role: "superadmin" | "admin";
  displayName: string | null;
  lastLoginAt?: string | null;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
