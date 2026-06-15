import { useRef, useState, useEffect } from "react";

export default function Testimonials() {
  const testimonials = [
    {
      text: "The curriculum is incredibly forward-thinking. I landed my dream job in tech within weeks of completing the CS track.",
      name: "Sarah J.",
      role: "CS Graduate",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyTwke8UDpdY9L_rx3C_nyy2L6lu-2Q9NrFa9TtNy-Zf6kiV6L3nDYHYQszrxd1ls-2xrmkaNHvjW0_YZOg9855WR9N1HYm34vvcLLhx2euHNZS5hedJVsRmEOCV3nhpmzQNMKkqkdfY7QWPkSYvBRxKr2POL1rHThDgDJnK2SeaC8Bt6SeVlYEjR1hLMwTSzlibWlDsYWh6YS3hJZcWijJjWOkE3lNbKhKH-4HtDfc2klzu_O1-dwUqmjZygXFB1kOplhJPBbrzw"
    },
    {
      text: "The fashion design workshop pushed my creative boundaries. The mentorship is truly unmatched.",
      name: "Marcus T.",
      role: "Design Alumnus",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeMT-gTbTD6WQQahpFRXEz4ju12FRNDLSG7rBXbstjqZYpy2xqhvVKLsHXf--xR5xJEws6d0nVyNs8WKrvo8bcy-51diFMM0jMnC8XLFQeh_0s338BprQ9JcME13jqY4F5zclbK2XttApSd2-fxK55ZXQIyPT1DfKp0Jva-i0e6gRHwTKrWwsSFzb65YxGLSikxs0uUOTgeuLFs95KhKpy7aZgx3RY2WX-hLUReAMUC3rYH3vksqRRYesPGR40WAPXiOtC6ioNamw"
    },
    {
      text: "Learning a new language felt daunting, but the immersive approach here made it natural and fun.",
      name: "Elena R.",
      role: "Language Student",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAV7So-q2OyzXH9CGjgHD6331w1lkH2DfxFnI-81ggpar9q7LWzDNr6RPVMGCPPZShLgmw3HdSpIozzdeQipwyqR4JIZRcWVrdhh-v3NJAokkCWlMBP8OCfqmKOdSdgQwVS4ZOGhGOLY-9osVzGniLjyqTJ8x1IkZ5PQgyU5qrrleimxrcJq9k2xbLeOOG0fEMsX7s9Gcc8DqHr7iN6v_PM4Hf7Qx6ec250GqZh3OmN9FO3QBtluy5I30gwHcGZAEErBe7J_U7bx-o"
    },
    {
      text: "The boutique management course was exactly what I needed to launch my own brand. The practical insights were invaluable.",
      name: "Aisha M.",
      role: "Boutique Owner",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeMT-gTbTD6WQQahpFRXEz4ju12FRNDLSG7rBXbstjqZYpy2xqhvVKLsHXf--xR5xJEws6d0nVyNs8WKrvo8bcy-51diFMM0jMnC8XLFQeh_0s338BprQ9JcME13jqY4F5zclbK2XttApSd2-fxK55ZXQIyPT1DfKp0Jva-i0e6gRHwTKrWwsSFzb65YxGLSikxs0uUOTgeuLFs95KhKpy7aZgx3RY2WX-hLUReAMUC3rYH3vksqRRYesPGR40WAPXiOtC6ioNamw"
    },
    {
      text: "I was able to upskill while working full-time thanks to the flexible schedule and engaging pre-recorded sessions.",
      name: "David L.",
      role: "IT Professional",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyTwke8UDpdY9L_rx3C_nyy2L6lu-2Q9NrFa9TtNy-Zf6kiV6L3nDYHYQszrxd1ls-2xrmkaNHvjW0_YZOg9855WR9N1HYm34vvcLLhx2euHNZS5hedJVsRmEOCV3nhpmzQNMKkqkdfY7QWPkSYvBRxKr2POL1rHThDgDJnK2SeaC8Bt6SeVlYEjR1hLMwTSzlibWlDsYWh6YS3hJZcWijJjWOkE3lNbKhKH-4HtDfc2klzu_O1-dwUqmjZygXFB1kOplhJPBbrzw"
    },
    {
      text: "The spoken English classes gave me the confidence to ace my interviews. I'm so grateful to the faculty.",
      name: "Karan S.",
      role: "Corporate Executive",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAV7So-q2OyzXH9CGjgHD6331w1lkH2DfxFnI-81ggpar9q7LWzDNr6RPVMGCPPZShLgmw3HdSpIozzdeQipwyqR4JIZRcWVrdhh-v3NJAokkCWlMBP8OCfqmKOdSdgQwVS4ZOGhGOLY-9osVzGniLjyqTJ8x1IkZ5PQgyU5qrrleimxrcJq9k2xbLeOOG0fEMsX7s9Gcc8DqHr7iN6v_PM4Hf7Qx6ec250GqZh3OmN9FO3QBtluy5I30gwHcGZAEErBe7J_U7bx-o"
    }
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const scrollPos = useRef(0);
  const hoverState = useRef(false);

  useEffect(() => {
    hoverState.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    let animationId: number;
    let speed = 1.0;

    const animate = () => {
      const targetSpeed = hoverState.current ? 0 : 1.0;
      speed += (targetSpeed - speed) * 0.05; // smooth interpolation

      scrollPos.current += speed;
      
      if (containerRef.current) {
         const halfWidth = containerRef.current.scrollWidth / 2;
         if (scrollPos.current >= halfWidth) {
           scrollPos.current -= halfWidth; // keep the remainder for smooth looping
         }
         containerRef.current.style.transform = `translateX(-${scrollPos.current}px)`;
      }

      animationId = requestAnimationFrame(animate);
    };
    
    // start loop
    animationId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section className="flex flex-col gap-8 w-full max-w-full overflow-hidden">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#ffffff]">
          Student Success Stories
        </h2>
        <p className="text-[#d1d5dc] mt-2 text-sm md:text-base">
          Hear from our thriving community of learners.
        </p>
      </div>

      <div 
        className="relative w-full overflow-hidden py-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div ref={containerRef} className="flex w-max gap-6">
          {/* Render array twice to create infinite scroll effect */}
          {[...testimonials, ...testimonials].map((testimonial, i) => (
            <div key={i} className="bento-card p-8 flex flex-col gap-6 relative w-[350px] shrink-0">
              <div className="text-[#eaa320] text-6xl leading-[0.5] font-serif font-black">&ldquo;</div>
              <p className="text-gray-600 font-medium relative z-10 flex-grow text-sm leading-relaxed">
                {testimonial.text}
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <img
                  alt={`Student testimonial ${testimonial.name}`}
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                  src={testimonial.image}
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
