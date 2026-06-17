import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { useEnroll } from "../context/EnrollContext";
import { useCoursesCatalog } from "../hooks/useCoursesCatalog";

const courseGradients = [
  "bg-gradient-to-br from-blue-50 to-white",
  "bg-gradient-to-br from-orange-50 to-white",
  "bg-gradient-to-br from-green-50 to-white",
  "bg-gradient-to-br from-purple-50 to-white",
];

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80";

export default function EnglishCourses() {
  const { sections } = useContent();
  const { openEnroll } = useEnroll();
  const { courses } = useCoursesCatalog("English");
  const displayCourses = courses.slice(0, 4);

  if (displayCourses.length === 0) return null;

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-12 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{sections.english.heading}</h2>
          <p className="text-gray-600">{sections.english.description}</p>
        </div>
        <Link to="/courses?category=English" className="text-[#eaa320] font-bold flex items-center gap-2 hover:text-[#de9b1f] transition-colors">
          View all courses <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayCourses.map((course, index) => (
          <div
            key={course.id}
            className={`bento-card overflow-hidden flex flex-col border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl group ${courseGradients[index % courseGradients.length]}`}
          >
            <div className="h-32 overflow-hidden">
              <img src={course.imageUrl || PLACEHOLDER_IMG} alt={course.courseName} className="w-full h-full object-cover" />
            </div>
            <div className="p-5 flex flex-col flex-grow gap-3">
              <div>
                {course.category && (
                  <span className="text-xs font-bold bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full mb-3 inline-block">
                    {course.category}
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-2">{course.courseName}</h3>
                <p className="text-gray-600 text-xs line-clamp-3">{course.description}</p>
              </div>
              <div className="mt-auto pt-4 flex gap-2">
                <button
                  onClick={() => openEnroll(course.id)}
                  className="btn-primary flex-1 py-3 text-sm flex justify-center items-center gap-2 relative overflow-hidden font-semibold group/btn cursor-pointer rounded-lg"
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
    </section>
  );
}
