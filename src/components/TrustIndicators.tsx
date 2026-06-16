import { History, BadgeCheck, Globe, CheckCircle, type LucideIcon } from "lucide-react";
import { useContent } from "../context/ContentContext";

const ICONS: Record<string, LucideIcon> = { History, BadgeCheck, Globe, CheckCircle };

export default function TrustIndicators() {
  const { trustIndicators } = useContent();

  return (
    <div className="w-full max-w-6xl mx-auto -mt-10 relative z-20 px-4">
      <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col sm:flex-row justify-between items-center py-6 px-4 md:px-10 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        {trustIndicators.map((item, idx) => {
          const Icon = ICONS[item.icon] ?? CheckCircle;
          return (
            <div key={idx} className="flex items-center gap-4 py-4 sm:py-0 px-2 md:px-6 w-full justify-center sm:justify-start">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Icon className="text-[#eaa320]" strokeWidth={1.5} size={32} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-lg leading-tight">{item.title}</span>
                <span className="text-gray-900 font-medium text-base">{item.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
