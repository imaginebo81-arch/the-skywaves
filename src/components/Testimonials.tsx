import { useRef, useState, useEffect } from "react";
import { useContent } from "../context/ContentContext";

export default function Testimonials() {
  const { testimonials } = useContent();

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
                {testimonial.quote}
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
