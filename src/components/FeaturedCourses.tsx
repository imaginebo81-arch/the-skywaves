import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { coursesData, courseGradients } from "../data/courses";

export default function FeaturedCourses() {
  const featured = coursesData.slice(0, 4);

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-12 py-16">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Computer Courses</h2>
          <p className="text-gray-600">Elevate your skills with our industry-relevant curriculum.</p>
        </div>
        <Link 
          to="/courses"
          className="text-[#eaa320] font-bold flex items-center gap-2 hover:text-[#de9b1f] transition-colors"
        >
          View all courses <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featured.map((course, index) => (
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
                <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
              </div>
              <div className="mt-auto pt-4">
                <button className="btn-primary w-full py-3 text-sm flex justify-center items-center gap-2 relative overflow-hidden group/btn cursor-pointer">
                  <div className="absolute inset-0 w-[150%] h-full -translate-x-[150%] group-hover/btn:translate-x-[150%] transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 z-0" />
                  <span className="relative z-10">Enroll Now</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
