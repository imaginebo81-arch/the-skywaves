import { BookOpen, Target, Users, Award, type LucideIcon } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useContent } from "../context/ContentContext";

const VALUE_ICONS: LucideIcon[] = [BookOpen, Target, Users, Award];

export default function AboutUs() {
  const { about } = useContent();

  return (
    <div className="flex flex-col gap-16">
      <Helmet>
        <title>{about.title}</title>
        <meta name="description" content={about.description} />
      </Helmet>

      <section className="relative rounded-[32px] overflow-hidden min-h-[400px] flex items-center justify-center p-8 md:p-16">
        <div className="absolute inset-0 z-0">
          <img src={about.heroImage} alt="Students collaborating" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm"></div>
        </div>
        <div className="relative z-10 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">{about.heroHeading}</h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">{about.heroSubheading}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <div className="inline-block px-4 py-2 bg-orange-100 text-[#eaa320] rounded-full text-sm font-semibold w-max">
            {about.storyBadge}
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{about.storyHeading}</h2>
          {about.storyParagraphs.map((para, i) => (
            <p key={i} className="text-gray-600 leading-relaxed text-lg text-justify">{para}</p>
          ))}
        </div>
        <div className="rounded-[24px] overflow-hidden shadow-xl">
          <img src={about.storyImage} alt="Campus view" className="w-full h-full object-cover min-h-[300px]" />
        </div>
      </section>

      <section className="bg-[#151b23] -mx-4 md:-mx-12 px-4 md:px-12 py-16 text-white rounded-[32px] my-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{about.valuesHeading}</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">{about.valuesDescription}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {about.values.map((val, idx) => {
            const Icon = VALUE_ICONS[idx % VALUE_ICONS.length];
            return (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="text-[#eaa320]" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">{val.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{val.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
