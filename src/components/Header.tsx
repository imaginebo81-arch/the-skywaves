import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useContent } from "../context/ContentContext";

export default function Header() {
  const navigate = useNavigate();
  const { meta, nav } = useContent();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const verificationRef = useRef<HTMLDivElement>(null);
  const coursesRef = useRef<HTMLDivElement>(null);

  const [home, secondLink, ...otherLinks] = nav.links;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (verificationRef.current && !verificationRef.current.contains(event.target as Node)) {
        setIsVerificationOpen(false);
      }
      if (coursesRef.current && !coursesRef.current.contains(event.target as Node)) {
        setIsCoursesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-dark sticky top-0 z-50 w-full h-[100px]">
      <div className="max-w-[1400px] mx-auto w-full h-full flex items-center justify-between px-4 md:px-12">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
          <img alt={meta.orgName} className="h-[31px] md:h-[41px] object-contain" src={meta.logoUrl} />
        </div>
        <nav className="hidden lg:flex gap-8 items-center cursor-pointer text-white">
          <Link to={home.to} className="font-semibold border-b-2 border-primary pb-1 hover:text-primary transition-all duration-200">
            {home.label}
          </Link>
          {secondLink && (
            <Link to={secondLink.to} className="hover:text-primary transition-all duration-200">
              {secondLink.label}
            </Link>
          )}
          <div className="relative z-50 flex items-center" ref={coursesRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCoursesOpen(!isCoursesOpen);
              }}
              className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
            >
              {nav.coursesDropdown.label} <ChevronDown size={14} className={`transition-transform duration-200 ${isCoursesOpen ? "rotate-180" : ""}`} />
            </button>
            {isCoursesOpen && (
              <div className="absolute top-[30px] left-0 mt-2 w-56 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden text-sm z-50 border border-gray-100 text-gray-700">
                {nav.coursesDropdown.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsCoursesOpen(false)}
                    className="px-4 py-3 hover:bg-orange-50 hover:text-[#eaa320] hover:pl-5 transition-all duration-200 border-b border-gray-100 last:border-b-0 font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {otherLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-primary transition-all duration-200">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="relative z-50 hidden lg:flex items-center" ref={verificationRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVerificationOpen(!isVerificationOpen);
              }}
              className="btn-primary px-6 py-2.5 text-sm flex items-center gap-1 whitespace-nowrap cursor-pointer text-dark"
            >
              {nav.verificationDropdown.label} <ChevronDown size={16} className={`transition-transform duration-200 text-dark ${isVerificationOpen ? "rotate-180" : ""}`} />
            </button>
            {isVerificationOpen && (
              <div className="absolute top-[40px] right-0 mt-2 w-56 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden text-sm z-50 border border-gray-100">
                {nav.verificationDropdown.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsVerificationOpen(false)}
                    className="px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-[#eaa320] hover:pl-5 transition-all duration-200 border-b border-gray-100 last:border-b-0 font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden text-primary p-2 cursor-pointer">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-[100px] left-0 w-full bg-dark flex flex-col items-center gap-6 py-8 lg:hidden shadow-lg border-t border-white/10 text-white z-50 overflow-y-auto max-h-[calc(100vh-100px)]">
          <Link onClick={() => setIsMobileMenuOpen(false)} to={home.to} className="font-semibold text-lg border-b-2 border-primary pb-1">
            {home.label}
          </Link>
          {secondLink && (
            <Link onClick={() => setIsMobileMenuOpen(false)} to={secondLink.to} className="hover:text-primary text-lg transition-colors">
              {secondLink.label}
            </Link>
          )}
          <div className="w-full px-6 flex flex-col items-center">
            <button onClick={() => setIsCoursesOpen(!isCoursesOpen)} className="flex items-center gap-2 hover:text-primary text-lg cursor-pointer transition-colors">
              {nav.coursesDropdown.label} <ChevronDown size={20} className={`transition-transform duration-200 ${isCoursesOpen ? "rotate-180" : ""}`} />
            </button>
            {isCoursesOpen && (
              <div className="flex flex-col items-center gap-4 mt-4 w-full max-w-[200px] bg-white/5 rounded-xl py-4 mx-auto border border-white/5">
                {nav.coursesDropdown.items.map((item, i) => (
                  <div key={item.to} className="flex flex-col items-center gap-4 w-full">
                    {i > 0 && <div className="w-12 h-px bg-white/10" />}
                    <Link onClick={() => setIsMobileMenuOpen(false)} to={item.to} className="hover:text-primary text-sm text-gray-300 transition-colors">
                      {item.label}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
          {otherLinks.map((link) => (
            <Link key={link.to} onClick={() => setIsMobileMenuOpen(false)} to={link.to} className="hover:text-primary text-lg transition-colors">
              {link.label}
            </Link>
          ))}
          <div className="w-full px-6 flex flex-col items-center">
            <button onClick={() => setIsVerificationOpen(!isVerificationOpen)} className="flex items-center gap-2 hover:text-[#eaa320] text-lg cursor-pointer transition-colors">
              {nav.verificationDropdown.label} <ChevronDown size={20} className={`transition-transform duration-200 ${isVerificationOpen ? "rotate-180" : ""}`} />
            </button>
            {isVerificationOpen && (
              <div className="flex flex-col items-center gap-4 mt-4 w-full max-w-[200px] bg-white/5 rounded-xl py-4 mx-auto border border-white/5">
                {nav.verificationDropdown.items.map((item, i) => (
                  <div key={item.to} className="flex flex-col items-center gap-4 w-full">
                    {i > 0 && <div className="w-12 h-px bg-white/10" />}
                    <Link onClick={() => setIsMobileMenuOpen(false)} to={item.to} className="hover:text-[#eaa320] text-sm text-gray-300 transition-colors">
                      {item.label}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
