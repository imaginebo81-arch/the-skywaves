import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { useEnroll } from "../context/EnrollContext";
import Testimonials from "../components/Testimonials";
import EnquiryForm from "../components/EnquiryForm";

export default function HypnosisPage() {
  const { marketingCourses, courseGradients } = useContent();
  const { openEnroll } = useEnroll();
  
  // Filter courses for Hypnosis category
  const hypnosisCourses = marketingCourses.filter(
    (c) => c.category === "Hypnosis"
  );

  // Add a demo course if there are no hypnosis courses
  if (hypnosisCourses.length === 0) {
    hypnosisCourses.push({
      id: "demo-hypnosis-1",
      title: "Clinical Hypnotherapy Certification",
      description: "Master the art of clinical hypnotherapy. Learn induction techniques, subconscious reprogramming, and therapeutic applications for modern practices.",
      category: "Hypnosis",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
      academicCourseId: null,
    });
  }

  return (
    <div className="w-full flex flex-col font-sans">
      <Helmet>
        <title>Hypnosis Courses - Skywaves Educare</title>
        <meta name="description" content="Explore our premium Hypnosis and Clinical Hypnotherapy courses at Skywaves Educare." />
      </Helmet>

      {/* Hero Section for Hypnosis Page */}
      <div className="relative bg-dark text-white py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop" 
            alt="Hypnosis Hero" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/50 to-dark" />
        </div>
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 relative z-10 flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl md:text-6xl font-bold max-w-4xl leading-tight">
            Unlock the Power of the Mind with our <span className="text-primary">Hypnosis Courses</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
            From basic techniques to advanced clinical applications. Master the art and science of hypnotherapy.
          </p>
        </div>
      </div>

      {/* Courses Section */}
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-12 py-20 flex flex-col gap-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Available Programs</h2>
          <p className="text-gray-600 text-lg">
            Choose from our comprehensive range of hypnosis courses to kickstart your career.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {hypnosisCourses.map((course, index) => (
            <div key={course.id} className={`bento-card overflow-hidden flex flex-col border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl group ${courseGradients[index % courseGradients.length]}`}>
              <div className="h-48 overflow-hidden relative">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-6 flex flex-col flex-grow gap-4 bg-white/60 backdrop-blur-sm">
                <div>
                  <span className="text-xs font-bold bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full mb-4 inline-block shadow-sm">
                    {course.category}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{course.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{course.description}</p>
                </div>
                <div className="mt-auto pt-4 flex gap-2">
                  <button onClick={() => openEnroll(course.academicCourseId)} className="btn-primary flex-1 py-3 text-sm cursor-pointer relative overflow-hidden group/btn rounded-lg font-semibold flex justify-center items-center">
                    <div className="absolute inset-0 w-[150%] h-full -translate-x-[150%] group-hover/btn:translate-x-[150%] transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 z-0" />
                    <span className="relative z-10 flex items-center gap-2">Enroll Now</span>
                  </button>
                  <Link to="/contact" className="flex-1 py-3 text-sm cursor-pointer flex justify-center items-center bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors rounded-lg font-semibold border border-gray-200">
                    Inquire
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {hypnosisCourses.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              New hypnosis courses coming soon! Please contact us for more information.
            </div>
          )}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="w-full bg-[#151b23]">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-12 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Student Success Stories</h2>
            <p className="text-gray-400">Hear from our students who transformed their lives through hypnotherapy.</p>
          </div>
          <Testimonials />
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-12 py-20">
        <EnquiryForm />
      </div>
    </div>
  );
}
