import { useRef, useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { publicApi } from "../lib/api/public";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  image_url: string | null;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const scrollPos = useRef(0);
  const hoverState = useRef(false);

  const [form, setForm] = useState({ name: "", profession: "", review: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    publicApi
      .getTestimonials()
      .then((res) => setTestimonials(res.items))
      .catch(() => {});
  }, []);

  useEffect(() => {
    hoverState.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    if (testimonials.length === 0) return;
    let animationId: number;
    let speed = 1.0;

    const animate = () => {
      const targetSpeed = hoverState.current ? 0 : 1.0;
      speed += (targetSpeed - speed) * 0.05;
      scrollPos.current += speed;
      if (containerRef.current) {
        const halfWidth = containerRef.current.scrollWidth / 2;
        if (scrollPos.current >= halfWidth) scrollPos.current -= halfWidth;
        containerRef.current.style.transform = `translateX(-${scrollPos.current}px)`;
      }
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [testimonials]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.review.trim() || !form.profession.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await publicApi.submitFeedback({ name: form.name, profession: form.profession, review: form.review });
      setSubmitted(true);
      setForm({ name: "", profession: "", review: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      setSubmitError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayItems = testimonials.length > 0 ? testimonials : [];

  return (
    <section className="flex flex-col gap-12 w-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-8 w-full">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#ffffff]">Student Success Stories</h2>
          <p className="text-[#d1d5dc] mt-2 text-sm md:text-base">Hear from our thriving community of learners.</p>
        </div>

        {displayItems.length > 0 && (
          <div
            className="relative w-full overflow-hidden py-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div ref={containerRef} className="flex w-max gap-6">
              {[...displayItems, ...displayItems].map((t, i) => (
                <div key={i} className="bento-card p-8 flex flex-col gap-6 relative w-[350px] shrink-0">
                  <div className="text-[#eaa320] text-6xl leading-[0.5] font-serif font-black">&ldquo;</div>
                  <p className="text-gray-600 font-medium relative z-10 flex-grow text-sm leading-relaxed">{t.quote}</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <img
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover shadow-sm"
                      src={
                        t.image_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random`
                      }
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-xl mx-auto w-full bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Share Your Experience</h3>
          <p className="text-sm text-gray-400">Your review will be reviewed and published once approved.</p>
        </div>

        {submitted ? (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-center text-sm font-medium">
            Thank you! Your review has been submitted for approval.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Profession</label>
                <input
                  type="text"
                  required
                  value={form.profession}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, profession: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g. Student, Designer"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Review</label>
              <textarea
                required
                rows={3}
                value={form.review}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, review: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                placeholder="Write your review here..."
              />
            </div>
            {submitError && <p className="text-red-400 text-sm">{submitError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 btn-primary w-full py-3 text-sm font-semibold cursor-pointer relative overflow-hidden flex justify-center items-center group/btn rounded-xl disabled:opacity-60"
            >
              <div className="absolute inset-0 w-[150%] h-full -translate-x-[150%] group-hover/btn:translate-x-[150%] transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 z-0" />
              <span className="relative z-10">{submitting ? "Submitting..." : "Submit Review"}</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
