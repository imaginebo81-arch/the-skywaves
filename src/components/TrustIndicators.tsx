import { History, BadgeCheck, Globe, CheckCircle, type LucideIcon } from "lucide-react";
import { useContent } from "../context/ContentContext";

const ICONS: Record<string, LucideIcon> = { History, BadgeCheck, Globe, CheckCircle };

export default function TrustIndicators() {
  const { trustIndicators } = useContent();

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 md:-mt-10 mb-12 md:mb-16 relative z-20 px-4">
      <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 grid grid-cols-2 sm:grid-cols-4 py-6 px-4 md:px-10 divide-y-0 sm:divide-x divide-gray-100">
        {trustIndicators.map((item, idx) => {
          const Icon = ICONS[item.icon] ?? CheckCircle;
          return (
            <div key={idx} className="flex items-center gap-4 py-4 px-2 md:px-6 w-full justify-center sm:justify-start border-b sm:border-b-0 border-gray-100 last:border-b-0 [&:nth-child(2)]:border-b [&:nth-child(2)]:sm:border-b-0">
              <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Icon className="text-[#eaa320]" strokeWidth={1.5} size={28} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-base leading-tight">{item.title}</span>
                <span className="text-gray-900 font-medium text-sm">{item.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
