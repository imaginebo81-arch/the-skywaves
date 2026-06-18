import { useEffect } from "react";
import { X, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEnroll } from "../context/EnrollContext";
import type { CatalogSubject } from "../hooks/useCoursesCatalog";

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80";

interface Props {
  course: CatalogSubject | null;
  onClose: () => void;
}

export default function CourseModal({ course, onClose }: Props) {
  const { openEnroll } = useEnroll();

  useEffect(() => {
    if (!course) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [course, onClose]);

  if (!course) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer">
          <X size={16} />
        </button>
        <div className="aspect-[16/10] overflow-hidden">
          <img src={course.imageUrl || PLACEHOLDER_IMG} alt={course.subjectName} className="w-full h-full object-cover" />
        </div>
        <div className="p-6 md:p-8">
          {course.courseName && (
            <span className="text-xs font-bold bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full mb-4 inline-block">
              {course.courseName}
            </span>
          )}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{course.subjectName}</h2>
          {course.duration && (
            <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
              <Clock size={14} />
              <span>{course.duration}</span>
            </div>
          )}
          {course.description && (
            <p className="text-gray-600 leading-relaxed mb-6">{course.description}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => { openEnroll(course.isCourse ? course.courseId : course.id); onClose(); }}
              className="btn-primary flex-1 py-3 text-base font-bold cursor-pointer flex justify-center items-center gap-2 rounded-xl"
            >
              Enroll Now <ArrowRight size={18} />
            </button>
            <Link
              to="/contact"
              onClick={onClose}
              className="flex-1 py-3 text-base cursor-pointer flex justify-center items-center bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors rounded-xl font-bold border border-gray-200"
            >
              Inquire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
