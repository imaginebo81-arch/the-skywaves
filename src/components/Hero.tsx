import { ArrowRight, CheckCircle } from "lucide-react";

export default function Hero() {
  const trustIndicators = [
    "Certified Programs",
    "Expert Trainers",
    "Practical Learning",
    "Career-Focused Training"
  ];

  return (
    <section
      className="glass-hero w-full h-[600px] flex items-end p-8 md:p-16 text-on-surface"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/dm3scoj2q/image/upload/v1781176425/ChatGPT_Image_Jun_11_2026_04_43_22_PM_nxj88b.webp')",
      }}
    >
      <div className="hero-content w-full max-w-4xl flex flex-col gap-6 text-on-secondary">
        <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg font-extrabold leading-tight">
          Transform Your Skills Into a Successful Career
        </h1>
        <p className="font-body-lg text-body-lg text-surface-container-highest max-w-2xl">
          Gain industry-relevant skills through expert-led training in Computer Education, English Communication, Fashion Design, and Clinical Hypnotherapy. Learn practically, earn recognized certifications, and build the confidence to achieve your career goals.
        </p>
        <div className="flex flex-wrap gap-4 mt-4">
          <button className="btn-primary px-8 py-4 font-title-md text-title-md flex items-center gap-2 cursor-pointer">
            Explore Courses
            <ArrowRight size={24} />
          </button>
          <button className="bg-surface/10 backdrop-blur-md text-on-secondary border-2 border-surface/30 rounded-[10px] px-8 py-4 font-title-md text-title-md hover:bg-surface/20 transition-all cursor-pointer">
            View Curriculum
          </button>
        </div>

        {/* Trust Indicators Marquee */}
        <div className="w-full overflow-hidden mask-edges mt-6 py-2">
          <div className="flex w-max animate-marquee text-on-secondary text-opacity-90">
            {/* Repeat the list for seamless looping */}
            {[...trustIndicators, ...trustIndicators, ...trustIndicators, ...trustIndicators].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 px-8 flex-shrink-0">
                <CheckCircle size={18} className="text-primary-fixed" />
                <span className="font-title-md font-medium text-lg whitespace-nowrap">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
