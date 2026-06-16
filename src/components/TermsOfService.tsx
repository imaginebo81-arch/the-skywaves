import { Helmet } from "react-helmet-async";
import { useContent } from "../context/ContentContext";

export default function TermsOfService() {
  const { legal } = useContent();
  const { terms } = legal;

  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 md:px-12 py-12 flex flex-col gap-8">
      <Helmet>
        <title>{terms.title} - Skywaves Educare</title>
        <meta name="description" content="Terms of Service for Skywaves Educare." />
      </Helmet>

      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{terms.title}</h1>
        <p className="text-gray-600 text-lg">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        {terms.sections.map((section, idx) => (
          <section key={idx}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {idx + 1}. {section.heading}
            </h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
