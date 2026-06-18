import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useContent } from "../context/ContentContext";
import { useEnroll } from "../context/EnrollContext";
import { useCoursesCatalog, type CatalogSubject } from "../hooks/useCoursesCatalog";
import CourseModal from "./CourseModal";

const courseGradients = [
  "bg-gradient-to-br from-orange-50 to-white",
  "bg-gradient-to-br from-blue-50 to-white",
  "bg-gradient-to-br from-green-50 to-white",
  "bg-gradient-to-br from-purple-50 to-white",
];

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80";

export default function FeaturedCourses() {
  const { featured } = useContent();
  const { openEnroll } = useEnroll();
  const { courses, loading } = useCoursesCatalog();
  const [selected, setSelected] = useState<CatalogSubject | null>(null);
  const displayCourses = courses.filter((c) => !c.isCourse).slice(0, 3);

  if (loading && displayCourses.length === 0) return null;
  if (!loading && displayCourses.length === 0) return null;

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-12 py-16">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{featured.heading}</h2>
          <p className="text-gray-600">{featured.description}</p>
        </div>
        <Link to="/courses" className="text-[#eaa320] font-bold flex items-center gap-2 hover:text-[#de9b1f] transition-colors">
          View all courses <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCourses.map((course, index) => (
          <div
            key={course.id}
            onClick={() => setSelected(course)}
            className={`bento-card overflow-hidden flex flex-col border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#eaa320] transition-all duration-300 rounded-2xl group cursor-pointer ${courseGradients[index % courseGradients.length]}`}
          >
            <div className="aspect-[16/10] overflow-hidden">
              <img src={course.imageUrl || PLACEHOLDER_IMG} alt={course.subjectName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 flex flex-col flex-grow gap-4">
              <div>
                {course.courseName && (
                  <span className="text-xs font-bold bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full mb-3 inline-block">
                    {course.courseName}
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.subjectName}</h3>
                <p className="text-gray-600 text-sm line-clamp-3">{course.description}</p>
              </div>
              <div className="mt-auto pt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => openEnroll(course.isCourse ? course.courseId : course.id)}
                  className="btn-primary flex-1 py-3 text-sm flex justify-center items-center gap-2 relative overflow-hidden group/btn cursor-pointer rounded-lg font-semibold"
                >
                  <div className="absolute inset-0 w-[150%] h-full -translate-x-[150%] group-hover/btn:translate-x-[150%] transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 z-0" />
                  <span className="relative z-10">Enroll Now</span>
                </button>
                <Link
                  to="/contact"
                  className="flex-1 py-3 text-sm cursor-pointer flex justify-center items-center bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors rounded-lg font-semibold border border-gray-200"
                >
                  Inquire
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CourseModal course={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
