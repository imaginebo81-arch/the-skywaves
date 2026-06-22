import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEnroll } from "../context/EnrollContext";
import { useCoursesCatalog, type CatalogCourse } from "../hooks/useCoursesCatalog";
import CourseModal from "../components/CourseModal";

const courseGradients = [
  "bg-gradient-to-br from-orange-50 to-white",
  "bg-gradient-to-br from-blue-50 to-white",
  "bg-gradient-to-br from-green-50 to-white",
  "bg-gradient-to-br from-purple-50 to-white",
  "bg-gradient-to-br from-pink-50 to-white",
  "bg-gradient-to-br from-yellow-50 to-white",
];

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80";

export default function CoursesPage() {
  const { openEnroll } = useEnroll();
  const { courses, loading } = useCoursesCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selected, setSelected] = useState<CatalogCourse | null>(null);

  useEffect(() => {
    setActiveCategory(searchParams.get("category") || "All");
  }, [searchParams]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(courses.map((c) => c.groupName).filter(Boolean))).sort();
    return ["All", ...cats];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (activeCategory === "All") return courses;
    return courses.filter((c) => c.groupName.toLowerCase() === activeCategory.toLowerCase());
  }, [courses, activeCategory]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    const next = new URLSearchParams(searchParams);
    if (cat === "All") next.delete("category");
    else next.set("category", cat);
    setSearchParams(next);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-12 py-12 flex flex-col gap-8">
      <Helmet>
        <title>Courses - Skywaves Educare</title>
        <meta name="description" content="Explore our wide range of premium courses at Skywaves Educare." />
      </Helmet>
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Courses</h1>
        <p className="text-gray-600 text-lg">
          Master the technologies driving tomorrow. Explore our diverse range of courses designed for everyone.
        </p>
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                activeCategory === cat ? "bg-[#eaa320] text-black" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bento-card overflow-hidden rounded-2xl animate-pulse">
              <div className="aspect-[16/10] bg-gray-200" />
              <div className="p-6 flex flex-col gap-3">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          {courses.length === 0
            ? "No courses available yet. Check back soon!"
            : "No courses found in this category."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <div
              key={course.id}
              onClick={() => setSelected(course)}
              className={`bento-card overflow-hidden flex flex-col border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#eaa320] transition-all duration-300 rounded-2xl group cursor-pointer ${courseGradients[index % courseGradients.length]}`}
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={course.imageUrl || PLACEHOLDER_IMG}
                  alt={course.courseName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow gap-4">
                <div>
                  {course.groupName && (
                    <span className="text-xs font-bold bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full mb-3 inline-block">
                      {course.groupName}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.courseName}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{course.description}</p>
                </div>
                <div className="mt-auto pt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEnroll(course.id)}
                    className="btn-primary flex-1 py-3 text-sm cursor-pointer relative overflow-hidden flex justify-center items-center group/btn rounded-lg font-semibold"
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
      )}

      <CourseModal course={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
