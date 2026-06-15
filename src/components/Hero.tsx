import { ArrowRight, FileText } from "lucide-react";

export default function Hero() {
  return (
    <section
      className="w-full bg-dark text-white pt-10 pb-20 relative overflow-hidden flex items-center min-h-[600px]"
    >
      <div className="max-w-[1400px] mx-auto w-full px-4 md:px-12 flex flex-col md:flex-row items-center gap-12">
        <div className="relative z-10 w-full md:w-1/2 flex flex-col gap-6 md:pr-4">
        <h1 className="text-[48px] font-extrabold leading-tight">
          Transform Your Skills <br className="hidden lg:block" />
          Into a <span className="text-[#eaa320]">Successful Career</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-xl">
          Trusted by learners across diverse fields, we provide quality education, professional guidance, and certifications that support long-term growth.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button className="btn-primary w-full sm:w-auto px-6 py-3 md:py-4 md:px-8 text-base md:text-lg flex justify-center items-center gap-2 cursor-pointer shadow-lg shadow-[#eaa320]/20">
            Explore Courses
            <ArrowRight size={20} />
          </button>
          <button className="btn-secondary text-gray-200 border-gray-600 rounded-lg w-full sm:w-auto px-6 py-3 md:py-4 md:px-8 text-base md:text-lg flex justify-center items-center gap-2 cursor-pointer hover:bg-white/5">
            View Curriculum
            <FileText size={20} />
          </button>
        </div>
      </div>
      
      <div className="relative z-10 w-full md:w-1/2 flex justify-center items-center mt-10 md:mt-0">
        <img 
          src="https://res.cloudinary.com/dm3scoj2q/image/upload/v1781505278/hero-3d-boy_dsrurq.png" 
          alt="3D Boy Student" 
          className="w-full max-w-[450px] lg:max-w-[550px] h-auto object-contain animate-float transition-all duration-500 hover:scale-105 hover:drop-shadow-[0_0_30px_rgba(234,163,32,0.4)] hover:-rotate-2 cursor-pointer"
        />
      </div>
      </div>
    </section>
  );
}
