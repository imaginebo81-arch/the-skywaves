import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { useEnroll } from "../context/EnrollContext";
import { useCoursesCatalog } from "../hooks/useCoursesCatalog";

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80";

export default function BoutiqueCourses() {
  const { sections } = useContent();
  const { openEnroll } = useEnroll();
  const { courses } = useCoursesCatalog("Boutique");
  const course = courses[0];

  if (!course) return null;

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-12 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{sections.boutique.heading}</h2>
          <p className="text-gray-600">{sections.boutique.description}</p>
        </div>
        <Link to="/courses?category=Boutique" className="text-[#eaa320] font-bold flex items-center gap-2 hover:text-[#de9b1f] transition-colors">
          View all courses
        </Link>
      </div>

      <div className="bento-card overflow-hidden flex flex-col md:flex-row border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl group w-full min-h-[300px] bg-gradient-to-br from-yellow-50 to-white">
        <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
          <img src={course.imageUrl || PLACEHOLDER_IMG} alt={course.subjectName} className="w-full h-full object-cover" />
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center gap-4">
          <div>
            {course.courseName && (
              <span className="text-xs font-bold bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full mb-4 inline-block">
                {course.courseName}
              </span>
            )}
            <h3 className="text-3xl font-bold text-gray-900 mb-4">{course.subjectName}</h3>
            <p className="text-gray-600 text-base md:text-lg mb-8">{course.description}</p>
          </div>
          <div className="mt-auto flex gap-3 flex-wrap">
            <button
              onClick={() => openEnroll(course.id)}
              className="btn-primary px-8 py-3 text-base flex justify-center items-center gap-2 relative overflow-hidden font-semibold w-fit group/btn cursor-pointer rounded-lg"
            >
              <div className="absolute inset-0 w-[150%] h-full -translate-x-[150%] group-hover/btn:translate-x-[150%] transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 z-0" />
              <span className="relative z-10">Enroll Now</span>
            </button>
            <Link
              to="/contact"
              className="px-8 py-3 text-base cursor-pointer flex justify-center items-center bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors rounded-lg font-semibold border border-gray-200"
            >
              Inquire
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
