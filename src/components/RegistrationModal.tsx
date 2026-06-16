import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { X, CheckCircle, Loader2, Upload } from "lucide-react";
import { useEnroll } from "../context/EnrollContext";
import { useApi, useMutation } from "../hooks/useApi";
import { publicApi } from "../lib/api/public";
import type { PublicCourse, RegistrationResult } from "../lib/api/types";

interface FormState {
  name: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: string;
  contactNumber: string;
  address: string;
  courseId: string;
}

const EMPTY: FormState = {
  name: "",
  fatherName: "",
  motherName: "",
  dateOfBirth: "",
  gender: "",
  contactNumber: "",
  address: "",
  courseId: "",
};

const inputClass =
  "w-full rounded-[10px] border border-outline-variant bg-white focus:ring-[#eaa320] focus:border-[#eaa320] p-3 outline-none";
const labelClass = "text-sm text-gray-700 font-medium mb-1.5 block";

export default function RegistrationModal() {
  const { isOpen, preselectedCourseId, closeEnroll } = useEnroll();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState<RegistrationResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: coursesData } = useApi<{ courses: PublicCourse[] }>(
    () => publicApi.getCourses(),
    []
  );
  const courses = useMemo(() => coursesData?.courses ?? [], [coursesData]);
  const { mutate: submit, loading } = useMutation(publicApi.createRegistration);

  useEffect(() => {
    if (isOpen) {
      setForm({ ...EMPTY, courseId: preselectedCourseId ?? "" });
      setPhoto(null);
      setPhotoPreview(null);
      setSuccess(null);
      setFormError(null);
    }
  }, [isOpen, preselectedCourseId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeEnroll();
    };
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeEnroll]);

  if (!isOpen) return null;

  const setField = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setFormError("Photo must be smaller than 3 MB");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!photo) {
      setFormError("Please upload a student profile photo");
      return;
    }
    try {
      const { path } = await publicApi.uploadProfilePhoto(photo);
      const result = await submit({
        name: form.name,
        fatherName: form.fatherName || undefined,
        motherName: form.motherName || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        address: form.address || undefined,
        contactNumber: form.contactNumber,
        courseId: form.courseId || undefined,
        profilePhotoPath: path,
      });
      setSuccess(result);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-dark text-white px-6 py-4 flex items-center justify-between rounded-t-[24px]">
          <h2 className="text-xl font-bold">Student Registration</h2>
          <button onClick={closeEnroll} className="text-white/80 hover:text-white cursor-pointer" aria-label="Close">
            <X size={24} />
          </button>
        </div>

        {success ? (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle size={36} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Registration Submitted</h3>
            <p className="text-gray-600">
              Thank you for registering. Your application is pending review by our admissions team.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-6 py-3">
              <p className="text-sm text-gray-500">Admission Number</p>
              <p className="text-2xl font-bold text-[#eaa320] tracking-wider">{success.admissionNumber}</p>
            </div>
            <button onClick={closeEnroll} className="btn-primary px-8 py-3 mt-2 cursor-pointer">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 hover:border-[#eaa320]"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Upload size={22} />
                    <span className="text-xs mt-1">Photo</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPhotoChange} />
              <span className="text-xs text-gray-500">Student Profile Photo (required)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Student Name</label>
                <input required className={inputClass} value={form.name} onChange={(e) => setField("name", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Contact Number</label>
                <input required className={inputClass} value={form.contactNumber} onChange={(e) => setField("contactNumber", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Father Name</label>
                <input className={inputClass} value={form.fatherName} onChange={(e) => setField("fatherName", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Mother Name</label>
                <input className={inputClass} value={form.motherName} onChange={(e) => setField("motherName", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => setField("dateOfBirth", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select className={inputClass} value={form.gender} onChange={(e) => setField("gender", e.target.value)}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Course</label>
                <select required className={inputClass} value={form.courseId} onChange={(e) => setField("courseId", e.target.value)}>
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Address</label>
                <textarea className={inputClass} rows={2} value={form.address} onChange={(e) => setField("address", e.target.value)} />
              </div>
            </div>

            {formError && <p className="text-red-600 text-sm">{formError}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 font-bold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60">
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Submitting..." : "Submit Registration"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
