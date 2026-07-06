import { X } from "lucide-react";
import { useState } from "react";

export default function Watermark() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 flex items-center bg-[#121212] border border-[#2a2a2a] rounded-xl p-0 text-white font-sans text-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-200 hover:bg-[#1a1a1a] hover:-translate-y-0.5 z-[9999] overflow-hidden">
      <a
        href="https://imagine.bo"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 py-2.5 px-3.5 no-underline text-inherit border-r border-[#2a2a2a]"
      >
        <span className="text-[#9ca3af] font-normal">Built with</span>
        <div className="w-4 h-4 flex items-center">
          <img src="/ImagineboIcon.svg" alt="Imagine.bo" className="w-full h-full object-contain" />
        </div>
        <span className="text-white font-semibold tracking-tight">Imagine.bo</span>
      </a>
      <div
        className="flex items-center justify-center px-3 h-10 text-[#4b5563] cursor-pointer transition-colors duration-200 hover:text-white hover:bg-[#262626]"
        onClick={() => setIsVisible(false)}
      >
        <X size={12} strokeWidth={3} />
      </div>
    </div>
  );
}
