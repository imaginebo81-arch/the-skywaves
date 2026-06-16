import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useContent } from "../context/ContentContext";
import { useEnroll } from "../context/EnrollContext";

export default function CoursesPage() {
  const { marketingCourses, courseCategories, courseGradients } = useContent();
  const { openEnroll } = useEnroll();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  useEffect(() => {
    setActiveCategory(searchParams.get("category") || "All");
  }, [searchParams]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    const next = new URLSearchParams(searchParams);
    if (cat === "All") next.delete("category");
    else next.set("category", cat);
    setSearchParams(next);
  };

  const filteredCourses =
    activeCategory === "All"
      ? marketingCourses
      : activeCategory === "Computer"
      ? marketingCourses.filter((c) => !["English", "Fashion", "Boutique"].includes(c.category))
      : marketingCourses.filter((c) => c.category === activeCategory || c.category.includes(activeCategory));

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-12 py-12 flex flex-col gap-8">
      <Helmet>
        <title>Courses - Skywaves Educare</title>
        <meta name="description" content="Explore our wide range of premium courses including Computer Science, Fashion Design, English, and Boutique Studies at Skywaves Educare." />
      </Helmet>
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Courses</h1>
        <p className="text-gray-600 text-lg">
          Master the technologies driving tomorrow. Explore our diverse range of courses designed for everyone.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {courseCategories.map((cat) => (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.map((course, index) => (
          <div key={course.id} className={`bento-card overflow-hidden flex flex-col border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl group ${courseGradients[index % courseGradients.length]}`}>
            <div className="h-32 overflow-hidden">
              <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 flex flex-col flex-grow gap-4">
              <div>
                <span className="text-xs font-bold bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full mb-3 inline-block">
                  {course.category}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3">{course.description}</p>
              </div>
              <div className="mt-auto pt-4">
                <button onClick={() => openEnroll(course.academicCourseId)} className="btn-primary w-full py-3 text-sm cursor-pointer relative overflow-hidden flex justify-center items-center group/btn">
                  <div className="absolute inset-0 w-[150%] h-full -translate-x-[150%] group-hover/btn:translate-x-[150%] transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 z-0" />
                  <span className="relative z-10">Enroll Now</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-20 text-gray-500">No courses found in this category.</div>
      )}
    </div>
  );
}
