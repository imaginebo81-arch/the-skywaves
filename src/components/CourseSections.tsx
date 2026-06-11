import { ChevronRight, TerminalSquare, Cpu, Compass, PenTool, Brain, ArrowRight } from "lucide-react";

export function ComputerScience() {
  return (
    <section className="flex flex-col gap-bento-gap">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background">
            Computer Science
          </h2>
          <p className="text-on-surface-variant mt-2 font-body-md text-body-md">
            Master the technologies driving tomorrow.
          </p>
        </div>
        <a
          className="text-secondary hover:text-secondary-container font-title-md text-title-md flex items-center gap-1 cursor-pointer"
        >
          View all <ChevronRight size={24} />
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-bento-gap">
        {/* Course Card 1 */}
        <div className="bento-card p-6 flex flex-col gap-4">
          <div className="h-40 overflow-hidden bg-surface-container-high relative rounded-[15px]">
            <img
              alt="Code on screen"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEE4REcyLhspoJMpTij2UcRMPgX5Aj8010VcER4LD1Bse3M-L5RDORwH1aJz6ZJKoHLrmy6k4K0zMHGwIUioMbS-lPo1AhJUSrwq1qfzyDWSxmC8ndlRWpkD9UW1fght3DVfcnGv8nYbsZwUVFu5uovqET6aUKZyApr9_RWeLRcIQIxiwdnKkLssLrqY8G1HmQDXFknRxoyicN9uOkINTj6qCO6nYibsj155bFlvOeuouGfynzemRp9tty1CTcCkElSD7aA3dg0L4"
            />
            <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm rounded-[8px] p-2 text-primary shadow-sm">
              <TerminalSquare size={20} />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <span className="chip font-label-sm text-label-sm">CS101</span>
            <span className="chip font-label-sm text-label-sm bg-tertiary-container/30 text-tertiary">
              Beginner
            </span>
          </div>
          <h3 className="font-title-md text-title-md text-on-surface">
            Introduction to Programming
          </h3>
          <p className="text-on-surface-variant font-body-md text-body-md flex-grow">
            Learn the fundamentals of Python, variables, and control structures.
          </p>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mt-2">
            <div className="h-full bg-gradient-to-r from-primary to-secondary w-3/4 rounded-full"></div>
          </div>
          <p className="text-right text-xs text-on-surface-variant font-label-sm mb-2">
            75% Enrolled
          </p>
          <a
            href="https://wa.me/?text=I%20would%20like%20to%20enroll%20in%20Introduction%20to%20Programming%20(CS101)"
            target="_blank"
            rel="noreferrer"
            className="btn-primary px-4 py-2 font-title-md text-sm text-center inline-block w-full mt-auto"
          >
            Enroll Now
          </a>
        </div>

        {/* Course Card 2 */}
        <div className="bento-card p-6 flex flex-col gap-4">
          <div className="h-40 overflow-hidden bg-surface-container-high relative rounded-[15px]">
            <img
              alt="Circuit board"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9Ci6EN2xaxopMVoXkk9h0h5GKZayY0uzdwxwoiet3n5SY67bJqcapu864OElHlP64plffUhHWU-4184nlEezJLOBZYZnyoKei3L4SMdXb0WCmScIixM9ZcsenRjsPIMKV_L05NriqKgkxBmd1YctprMCFK-EgMZjVnwxeeo14c6-DQijaL9BS2HbUtRXfz7f8_4mYmFEMEklzytO-QixyyZXbn2FLthq6u-PYJG7iUUPQjla4O5aUbweIveWwptHugHk1OG3tsfc"
            />
            <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm rounded-[8px] p-2 text-secondary shadow-sm">
              <Cpu size={20} />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <span className="chip font-label-sm text-label-sm">CS204</span>
            <span className="chip font-label-sm text-label-sm bg-primary-container/30 text-on-primary-container">
              Intermediate
            </span>
          </div>
          <h3 className="font-title-md text-title-md text-on-surface">
            Data Structures & Algorithms
          </h3>
          <p className="text-on-surface-variant font-body-md text-body-md flex-grow">
            Deep dive into optimizing code and understanding complex data
            organization.
          </p>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mt-2">
            <div className="h-full bg-gradient-to-r from-primary to-secondary w-1/2 rounded-full"></div>
          </div>
          <p className="text-right text-xs text-on-surface-variant font-label-sm mb-2">
            50% Enrolled
          </p>
          <a
            href="https://wa.me/?text=I%20would%20like%20to%20enroll%20in%20Data%20Structures%20%26%20Algorithms%20(CS204)"
            target="_blank"
            rel="noreferrer"
            className="btn-primary px-4 py-2 font-title-md text-sm text-center inline-block w-full mt-auto"
          >
            Enroll Now
          </a>
        </div>

        {/* CTA Card */}
        <div className="bento-card p-6 flex flex-col justify-center items-center text-center gap-4 bg-gradient-to-br from-surface to-surface-container-high border-dashed border-2 border-outline-variant">
          <div className="w-16 h-16 rounded-[12px] bg-primary-container/20 flex items-center justify-center text-primary mb-2">
            <Compass size={32} />
          </div>
          <h3 className="font-title-md text-title-md text-on-surface">
            Explore More CS Courses
          </h3>
          <p className="text-on-surface-variant font-body-md text-body-md">
            Discover advanced topics in AI, Web Dev, and Cybersecurity.
          </p>
          <button className="bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container px-6 py-2 mt-4 font-title-md text-title-md rounded-[10px] transition-colors cursor-pointer">
            View Catalog
          </button>
        </div>
      </div>
    </section>
  );
}

export function LanguageMastery() {
  return (
    <section className="flex flex-col gap-bento-gap">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background">
            Language Mastery
          </h2>
          <p className="text-on-surface-variant mt-2 font-body-md text-body-md">
            Connect with the world through words.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-bento-gap">
        {/* Large Feature Card */}
        <div className="bento-card p-0 flex flex-col md:flex-row overflow-hidden group">
          <div className="w-full md:w-2/5 h-64 md:h-auto relative overflow-hidden rounded-t-[15px] md:rounded-tr-none md:rounded-l-[15px]">
            <img
              alt="Books and coffee"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-[15px] md:rounded-tr-none md:rounded-l-[15px]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJqwE0KJ1jVMYseww8vkqA7kNi4qrmPRYUco8319CaeOlHDY6EgUBSaemOdi8hszOZxr1L1JxdcgZvNfV8-XLv31Tmfe905UmVv3lr04bYIor2IBwDlFZ9iLGhdu0Q3tngXCLzOetJEfS67dEYPCtbx6DohgmBNX0T4BmQLj0JhShr0f1wjTh0VJnz2jysKriooCS50FZlVKw_xrSVThTnT7Rit-nm6jblhhgB_0EAOMSyyAou2A7pvipLOjynwFGABP6DVKAJJBM"
            />
          </div>
          <div className="w-full md:w-3/5 p-8 flex flex-col gap-4 justify-center">
            <div className="flex gap-2">
              <span className="chip font-label-sm text-label-sm">LNG301</span>
              <span className="chip font-label-sm text-label-sm bg-secondary-container/30 text-secondary">
                Advanced
              </span>
            </div>
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile md:text-headline-lg md:font-headline-lg text-on-surface">
              Creative Writing Workshop
            </h3>
            <p className="text-on-surface-variant font-body-md text-body-md">
              Hone your voice and explore narrative structures in a collaborative,
              intensive workshop environment.
            </p>
            <div className="mt-4">
              <a
                href="https://wa.me/?text=I%20would%20like%20to%20enroll%20in%20Creative%20Writing%20Workshop%20(LNG301)"
                target="_blank"
                rel="noreferrer"
                className="btn-primary px-6 py-2 font-title-md text-title-md inline-block"
              >
                Enroll Now
              </a>
            </div>
          </div>
        </div>

        {/* Stacked Cards */}
        <div className="flex flex-col gap-bento-gap">
          <div className="bento-card p-6 flex items-center gap-6">
            <div className="w-20 h-20 bg-surface-container-highest flex-shrink-0 overflow-hidden rounded-[15px]">
              <img
                alt="Japanese text"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBomexHbNNSl7jAp5fxZ8h_gqmkCS1JO3mYj0JD9Yw3ch-GNHqWY3vy79acnMEP8w0u5Yj24dMlcxcAnDOlUun8JPwDJ6mzRXv-qX2USG84VObBL4Qjj208D-Hy__6zTU7DS-rGIDzoKLLt2gzQr3eliUut7_K5eiqEVtWJwKqkoSspHbSeVJxcoh9GVIdJ-KE6eheeRhtzWLszVzkW1XBKlv2pJ23Lv0La826gDXGgw3Jv7pM6UCmjclFDQQ9XHeOoOfoY1NW2kz8"
              />
            </div>
            <div className="flex-1">
              <span className="font-label-sm text-label-sm text-secondary mb-1 block">
                LNG102
              </span>
              <h4 className="font-title-md text-title-md text-on-surface">
                Japanese Level 1
              </h4>
              <p className="text-on-surface-variant text-sm mt-1 mb-3">
                Master Hiragana and basic conversation.
              </p>
              <a
                href="https://wa.me/?text=I%20would%20like%20to%20enroll%20in%20Japanese%20Level%201%20(LNG102)"
                target="_blank"
                rel="noreferrer"
                className="btn-primary px-4 py-2 font-title-md text-sm text-center inline-block"
              >
                Enroll Now
              </a>
            </div>
          </div>
          <div className="bento-card p-6 flex items-center gap-6">
            <div className="w-20 h-20 bg-surface-container-highest flex-shrink-0 overflow-hidden rounded-[15px]">
              <img
                alt="Eiffel Tower"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDC0O8_SPcaLuSUWiRMXT1TRx6l2pBlGwDtkPD1e6vhwBp38SbK0XzCrkQQWk2daXJfAqf7q6iWQdnVMlAg0k2LUq5FMDA4z73LilvT0TsWnPUqs2Pe-YN8wYEknUDZPk66RGz4wJkkgEKylO-V-iR8u7YoHDpCO9ykQ3n1mgHZ62ckURZfmJl6qjWwSSEjr5HPZcfn8ji2oXj6PYIf9Hbew24mMpsmpinv02rrXYr983ujeskGLpQV3r9vxy-r2L6s76hKkgnb4NA"
              />
            </div>
            <div className="flex-1">
              <span className="font-label-sm text-label-sm text-primary mb-1 block">
                LNG205
              </span>
              <h4 className="font-title-md text-title-md text-on-surface">
                Conversational French
              </h4>
              <p className="text-on-surface-variant text-sm mt-1 mb-3">
                Focus on practical dialogue and culture.
              </p>
              <a
                href="https://wa.me/?text=I%20would%20like%20to%20enroll%20in%20Conversational%20French%20(LNG205)"
                target="_blank"
                rel="noreferrer"
                className="btn-primary px-4 py-2 font-title-md text-sm text-center inline-block"
              >
                Enroll Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CreativeWellness() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-bento-gap">
      {/* Fashion Design */}
      <div className="bento-card p-8 bg-gradient-to-br from-tertiary-fixed to-surface-container-lowest border-none relative overflow-hidden flex flex-col justify-between min-h-[400px]">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-tertiary-container rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-tertiary text-on-tertiary flex items-center justify-center mb-6 shadow-lg shadow-tertiary/30">
            <PenTool size={28} />
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-background mb-2">
            Fashion Design
          </h2>
          <p className="text-on-surface-variant font-body-lg text-body-lg mb-6 max-w-sm">
            From concept sketches to runway execution. Learn the art and business
            of modern apparel.
          </p>
        </div>
        <div className="relative z-10 flex items-center justify-between mt-auto">
          <div className="flex -space-x-4">
            <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high overflow-hidden">
              <img
                alt="Student 1"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDC8B9BOwXK6V1gOpr8534wSEyZpH7Jh9l9LQ4p78m75-fu9EmSvbLUTWQx3PTU8gruSDTS9Kz7bx4qoHv0H9w9a7d8zGg4pClvTNfBGOXxc8tkzx9pbv4PNhVCEVmNrLo--px0iYBqH2kcQjsSHdhaWbAI4EG-Qs3m2vwJfIc4RlgB_bKcpuHj6NbbofNakShLD0rACbjip7bHKhuMhygGSkj6jMZlxLY_hlNWiTV_08FVwfyJflToBWSy37YfkmCMQVowmcxrv7U"
              />
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high overflow-hidden">
              <img
                alt="Student 2"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpIUEy6vyYHP8wOlDt3EqFFgEW70AB929Wa9DuAPkFTPW1XlYt6xCzf-lc5GxdFvX230krPCbUuiITKrK4cQLL6GH2FPToL1N__3nhJw7wZpTfi0tybUqp8MKqTzURRFWETv7WS9Iuhy-USQbzFbaVNR-fLv3CDEEnbDt843DC5j5YZza2IenztyfWQMm5iFm0HjC3o8XYAyBQ6vwIQlYg93X3HnYllqhL--zWF9gr3YFTSTX1L5Hk5JxZ-XpxwLa-8iYNfi1kPIs"
              />
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high overflow-hidden">
              <img
                alt="Student 3"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuChgk5SMT9oqNKPMXPVwNPkVG8ESRzWoue7FEY6V4kMKdehiOxHJsgwJgJzLEzirQ--7GlOJWZmLL1VfgPhTQCbKj165MS6QAT1Eo3D5MOA9h7Xim541nQv69Hntn4ftbZOSflqwKbshgEy81iTw-k8zhajJB4QAHhSngJsGwbwy58y2LAjrka5HdFwM8W9QDxQXgAAYgLKGaNELbj0tCGasm-Zy2ACXj3nCLz-8ITxEd64seme27W6HpazMI2oH-V2JKsVB5eYLr8"
              />
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-xs font-bold text-on-surface-variant">
              +42
            </div>
          </div>
          <a
            href="https://wa.me/?text=I%20would%20like%20to%20enroll%20in%20Fashion%20Design"
            target="_blank"
            rel="noreferrer"
            className="bg-surface text-on-surface font-title-md text-sm rounded-[10px] px-6 py-3 shadow-md hover:bg-tertiary hover:text-on-tertiary transition-colors cursor-pointer text-center inline-block"
          >
            Enroll Now
          </a>
        </div>
      </div>

      {/* Hypnotherapy */}
      <div className="bento-card p-8 bg-gradient-to-bl from-primary-fixed to-surface-container-lowest border-none relative overflow-hidden flex flex-col justify-between min-h-[400px]">
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-primary-container rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
            <Brain size={28} />
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-background mb-2">
            Hypnotherapy Certification
          </h2>
          <p className="text-on-surface-variant font-body-lg text-body-lg mb-6 max-w-sm">
            Unlock the power of the subconscious mind. Comprehensive training for
            wellness professionals.
          </p>
        </div>
        <div className="relative z-10 mt-auto">
          <div className="bg-surface/60 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-surface/50">
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                Next Cohort
              </p>
              <p className="font-title-md text-title-md text-on-surface">
                September 15th
              </p>
            </div>
            <a
              href="https://wa.me/?text=I%20would%20like%20to%20enroll%20in%20Hypnotherapy%20Certification"
              target="_blank"
              rel="noreferrer"
              className="btn-primary px-6 py-2 font-title-md text-title-md flex-shrink-0 ml-2 text-center inline-block"
            >
              Enroll Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
