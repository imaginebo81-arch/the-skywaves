import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useEnroll } from "../context/EnrollContext";
import { useCoursesCatalog, type CatalogCourse } from "../hooks/useCoursesCatalog";
import CourseModal from "./CourseModal";

const sectionGradients = [
  "bg-gradient-to-br from-blue-50 to-white",
  "bg-gradient-to-br from-orange-50 to-white",
  "bg-gradient-to-br from-green-50 to-white",
  "bg-gradient-to-br from-purple-50 to-white",
  "bg-gradient-to-br from-pink-50 to-white",
  "bg-gradient-to-br from-yellow-50 to-white",
];

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80";

export default function CoursesSections() {
  const { openEnroll } = useEnroll();
  const { courses, loading } = useCoursesCatalog();
  const [selected, setSelected] = useState<CatalogCourse | null>(null);

  if (loading || courses.length === 0) return null;

  const grouped: { groupId: string; groupName: string; courses: CatalogCourse[] }[] = [];
  const indexByGroupId: Record<string, number> = {};
  for (const c of courses) {
    if (indexByGroupId[c.groupId] === undefined) {
      indexByGroupId[c.groupId] = grouped.length;
      grouped.push({ groupId: c.groupId, groupName: c.groupName, courses: [] });
    }
    grouped[indexByGroupId[c.groupId]].courses.push(c);
  }

  return (
    <>
      {grouped.map((group, gi) => (
        <section key={group.groupId} className="w-full max-w-[1400px] mx-auto px-4 md:px-12 pt-4 pb-16">
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end mb-8 gap-2 md:gap-4">
            <h2 className="text-3xl font-bold text-gray-900">{group.groupName}</h2>
            <Link
              to={`/courses?category=${encodeURIComponent(group.groupName)}`}
              className="text-[#eaa320] font-bold flex items-center gap-2 hover:text-[#de9b1f] transition-colors whitespace-nowrap"
            >
              View all courses <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.courses.slice(0, 3).map((course, index) => (
              <div
                key={course.id}
                onClick={() => setSelected(course)}
                className={`bento-card overflow-hidden flex flex-col border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#eaa320] transition-all duration-300 rounded-2xl group cursor-pointer ${sectionGradients[(gi + index) % sectionGradients.length]}`}
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={course.imageUrl || PLACEHOLDER_IMG}
                    alt={course.courseName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{course.courseName}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{course.description}</p>
                  </div>
                  <div className="mt-auto pt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
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
      ))}

      <CourseModal course={selected} onClose={() => setSelected(null)} />
    </>
  );
}
