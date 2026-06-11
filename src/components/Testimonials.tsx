import { Quote } from "lucide-react";

export default function Testimonials() {
  return (
    <section className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="font-headline-lg text-headline-lg text-on-background">
          Student Success Stories
        </h2>
        <p className="text-on-surface-variant mt-2 font-body-md text-body-md">
          Hear from our thriving community of learners.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-bento-gap">
        <div className="bento-card p-6 flex flex-col gap-4 relative">
          <Quote className="absolute top-4 right-4 text-primary-container/30 w-12 h-12" />
          <p className="text-on-surface-variant italic font-body-md relative z-10 flex-grow pt-4">
            "The curriculum is incredibly forward-thinking. I landed my dream job
            in tech within weeks of completing the CS track."
          </p>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-surface-variant">
            <img
              alt="Student testimonial Sarah"
              className="w-12 h-12 rounded-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyTwke8UDpdY9L_rx3C_nyy2L6lu-2Q9NrFa9TtNy-Zf6kiV6L3nDYHYQszrxd1ls-2xrmkaNHvjW0_YZOg9855WR9N1HYm34vvcLLhx2euHNZS5hedJVsRmEOCV3nhpmzQNMKkqkdfY7QWPkSYvBRxKr2POL1rHThDgDJnK2SeaC8Bt6SeVlYEjR1hLMwTSzlibWlDsYWh6YS3hJZcWijJjWOkE3lNbKhKH-4HtDfc2klzu_O1-dwUqmjZygXFB1kOplhJPBbrzw"
            />
            <div>
              <h4 className="font-title-md text-sm text-on-surface">Sarah J.</h4>
              <p className="text-xs text-on-surface-variant">CS Graduate</p>
            </div>
          </div>
        </div>

        <div className="bento-card p-6 flex flex-col gap-4 relative">
          <Quote className="absolute top-4 right-4 text-tertiary-container/30 w-12 h-12" />
          <p className="text-on-surface-variant italic font-body-md relative z-10 flex-grow pt-4">
            "The fashion design workshop pushed my creative boundaries. The
            mentorship is truly unmatched."
          </p>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-surface-variant">
            <img
              alt="Student testimonial Marcus"
              className="w-12 h-12 rounded-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeMT-gTbTD6WQQahpFRXEz4ju12FRNDLSG7rBXbstjqZYpy2xqhvVKLsHXf--xR5xJEws6d0nVyNs8WKrvo8bcy-51diFMM0jMnC8XLFQeh_0s338BprQ9JcME13jqY4F5zclbK2XttApSd2-fxK55ZXQIyPT1DfKp0Jva-i0e6gRHwTKrWwsSFzb65YxGLSikxs0uUOTgeuLFs95KhKpy7aZgx3RY2WX-hLUReAMUC3rYH3vksqRRYesPGR40WAPXiOtC6ioNamw"
            />
            <div>
              <h4 className="font-title-md text-sm text-on-surface">Marcus T.</h4>
              <p className="text-xs text-on-surface-variant">Design Alumnus</p>
            </div>
          </div>
        </div>

        <div className="bento-card p-6 flex flex-col gap-4 relative">
          <Quote className="absolute top-4 right-4 text-secondary-container/30 w-12 h-12" />
          <p className="text-on-surface-variant italic font-body-md relative z-10 flex-grow pt-4">
            "Learning a new language felt daunting, but the immersive approach
            here made it natural and fun."
          </p>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-surface-variant">
            <img
              alt="Student testimonial Elena"
              className="w-12 h-12 rounded-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAV7So-q2OyzXH9CGjgHD6331w1lkH2DfxFnI-81ggpar9q7LWzDNr6RPVMGCPPZShLgmw3HdSpIozzdeQipwyqR4JIZRcWVrdhh-v3NJAokkCWlMBP8OCfqmKOdSdgQwVS4ZOGhGOLY-9osVzGniLjyqTJ8x1IkZ5PQgyU5qrrleimxrcJq9k2xbLeOOG0fEMsX7s9Gcc8DqHr7iN6v_PM4Hf7Qx6ec250GqZh3OmN9FO3QBtluy5I30gwHcGZAEErBe7J_U7bx-o"
            />
            <div>
              <h4 className="font-title-md text-sm text-on-surface">Elena R.</h4>
              <p className="text-xs text-on-surface-variant">Language Student</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
