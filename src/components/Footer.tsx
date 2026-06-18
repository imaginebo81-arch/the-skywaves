import { Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useContent } from "../context/ContentContext";
import { publicApi } from "../lib/api/public";

const SOCIAL_ICONS = [
  { key: "facebook", Icon: Facebook },
  { key: "instagram", Icon: Instagram },
  { key: "youtube", Icon: Youtube },
  { key: "twitter", Icon: Twitter },
  { key: "linkedin", Icon: Linkedin },
] as const;

export default function Footer() {
  const { meta, footer } = useContent();
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    publicApi.getSocialLinks().then(setSocialLinks).catch(() => {});
  }, []);

  return (
    <footer className="bg-dark text-white w-full border-t border-white/10">
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-12 py-16 flex flex-col gap-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-start">
          <div className="flex flex-col gap-6 md:col-span-2 max-w-sm">
            <img alt={meta.orgName} className="h-[49px] object-contain object-left" src={meta.logoUrl} />
            <p className="text-gray-300 text-sm leading-relaxed">{footer.tagline}</p>
            <div className="flex gap-4">
              {SOCIAL_ICONS.filter(({ key }) => !!socialLinks[key]).map(({ key, Icon }) => (
                <a key={key} href={socialLinks[key]} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center hover:bg-[#eaa320] hover:text-black hover:border-[#eaa320] transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-white mb-2 text-lg">Quick Links</h3>
            {footer.quickLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-gray-300 hover:text-[#eaa320] transition-colors text-sm font-medium">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-white mb-2 text-lg">Courses</h3>
            {footer.courseLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-gray-300 hover:text-[#eaa320] transition-colors text-sm font-medium">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-12 py-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-400 text-sm">{footer.copyright}</p>
        <nav className="flex flex-wrap justify-center gap-6">
          {footer.bottomLinks.map((link) => (
            <Link key={link.to} to={link.to} className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
