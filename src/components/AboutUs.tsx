import { BookOpen, Target, Users, Award } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function AboutUs() {
  return (
    <div className="flex flex-col gap-16">
      <Helmet>
        <title>About Us - Skywaves Educare</title>
        <meta name="description" content="Learn about Skywaves Educare's mission, story, and core values in providing top-tier, industry-aligned education to our vibrant student community." />
      </Helmet>
      {/* Hero Section */}
      <section className="relative rounded-[32px] overflow-hidden min-h-[400px] flex items-center justify-center p-8 md:p-16">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
            alt="Students collaborating"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Empowering the Next Generation of Innovators
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            At Skywaves Educare, we believe in accessible, high-quality education that bridges the gap between ambition and reality.
          </p>
        </div>
      </section>

      {/* Our Story & Mission */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <div className="inline-block px-4 py-2 bg-orange-100 text-[#eaa320] rounded-full text-sm font-semibold w-max">
            Our Story
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            A Legacy of Excellence in Education
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg text-justify">
            Founded with a vision to democratize specialized education, Skywaves Educare has grown from a modest training institute into a premier educational hub. We identified a critical need for practical, industry-aligned training in emerging fields like Computer Science, Fashion Design, and Advanced Language Arts.
          </p>
          <p className="text-gray-600 leading-relaxed text-lg text-justify">
            Over the years, our dedicated faculty and dynamic curriculum have transformed thousands of lives, turning passionate learners into successful professionals and visionary entrepreneurs.
          </p>
        </div>
        <div className="rounded-[24px] overflow-hidden shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop" 
            alt="Campus view" 
            className="w-full h-full object-cover min-h-[300px]"
          />
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-[#151b23] -mx-4 md:-mx-12 px-4 md:px-12 py-16 text-white rounded-[32px] my-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">The principles that guide our educational approach and institutional culture.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <BookOpen className="text-[#eaa320]" size={32} />,
              title: "Academic Rigor",
              desc: "Maintaining the highest standards in our curriculum and instructional design."
            },
            {
              icon: <Target className="text-[#eaa320]" size={32} />,
              title: "Practical Focus",
              desc: "Ensuring every lesson has real-world application and career relevance."
            },
            {
              icon: <Users className="text-[#eaa320]" size={32} />,
              title: "Inclusivity",
              desc: "Fostering a welcoming environment for students from all backgrounds."
            },
            {
              icon: <Award className="text-[#eaa320]" size={32} />,
              title: "Continuous Growth",
              desc: "Encouraging a lifelong love for learning and self-improvement."
            }
          ].map((val, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                {val.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{val.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
