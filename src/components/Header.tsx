import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { useCourseGroups } from "../hooks/useCourseGroups";
import nameIconLogo from "../../assets/nameicon.png";
import iconLogo from "../../assets/icon.png";

export default function Header() {
  const navigate = useNavigate();
  const { meta, nav } = useContent();
  const { groups } = useCourseGroups();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const verificationRef = useRef<HTMLDivElement>(null);
  const coursesRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLImageElement>(null);
  const [compactLogo, setCompactLogo] = useState(false);

  const [home, secondLink, ...otherLinks] = nav.links;

  const measureLogo = useCallback(() => {
    const bar = barRef.current;
    const ruler = rulerRef.current;
    if (!bar || !ruler) return;
    const cs = getComputedStyle(bar);
    const padLeft = parseFloat(cs.paddingLeft) || 0;
    const padRight = parseFloat(cs.paddingRight) || 0;
    const barWidth = bar.clientWidth;
    const fullLogoWidth = ruler.offsetWidth;
    const gap = 24;
    const nav = navRef.current;
    const navVisible = !!nav && nav.offsetWidth > 0 && getComputedStyle(nav).display !== "none";
    const boundary = navVisible
      ? barWidth / 2 - nav!.offsetWidth / 2
      : barWidth - padRight - (actionsRef.current?.offsetWidth ?? 0);
    setCompactLogo(padLeft + fullLogoWidth + gap > boundary);
  }, []);

  useEffect(() => {
    measureLogo();
    const ro = new ResizeObserver(measureLogo);
    if (barRef.current) ro.observe(barRef.current);
    if (navRef.current) ro.observe(navRef.current);
    window.addEventListener("resize", measureLogo);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureLogo);
    };
  }, [measureLogo, groups.length]);

  const courseGroupItems = groups.map((g) => ({
    label: g.name,
    to: `/courses?category=${encodeURIComponent(g.name)}`,
  }));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && mobileMenuRef.current.contains(event.target as Node)) return;
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

  const closeMobile = () => {
    setIsMobileMenuOpen(false);
    setIsVerificationOpen(false);
    setIsCoursesOpen(false);
  };

  return (
    <header className="bg-dark sticky top-0 z-50 w-full h-[100px]">
      <div ref={barRef} className="relative w-full h-full flex items-center justify-between px-4 md:px-12">
        <div className="relative flex items-center cursor-pointer" onClick={() => navigate("/")}>
          <img
            alt={meta.orgName}
            className={`${compactLogo ? "h-11 md:h-12" : "h-12 md:h-16"} w-auto object-contain`}
            src={compactLogo ? iconLogo : nameIconLogo}
          />
          <img
            ref={rulerRef}
            src={nameIconLogo}
            alt=""
            aria-hidden="true"
            onLoad={measureLogo}
            className="h-12 md:h-16 w-auto object-contain invisible absolute left-0 top-0 pointer-events-none -z-10"
          />
        </div>
        <nav ref={navRef} className="hidden lg:flex gap-8 items-center cursor-pointer text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link to={home.to} className="font-semibold border-b-2 border-primary pb-1 hover:text-primary transition-all duration-200">
            {home.label}
          </Link>
          {secondLink && (
            <Link to={secondLink.to} className="hover:text-primary transition-all duration-200">
              {secondLink.label}
            </Link>
          )}
          {courseGroupItems.length > 0 && (
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
                  {courseGroupItems.map((item) => (
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
          )}
          {otherLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-primary transition-all duration-200">
              {link.label}
            </Link>
          ))}
        </nav>
        <div ref={actionsRef} className="flex items-center gap-4">
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
        <div ref={mobileMenuRef} className="fixed top-[100px] left-0 w-full bg-dark flex flex-col items-center gap-6 py-8 lg:hidden shadow-lg border-t border-white/10 text-white z-50 overflow-y-scroll max-h-[calc(100dvh-100px)]" style={{ WebkitOverflowScrolling: "touch" }}>
          <Link onClick={closeMobile} to={home.to} className="font-semibold text-lg border-b-2 border-primary pb-1">
            {home.label}
          </Link>
          {secondLink && (
            <Link onClick={closeMobile} to={secondLink.to} className="hover:text-primary text-lg transition-colors">
              {secondLink.label}
            </Link>
          )}
          {courseGroupItems.length > 0 && (
            <div className="w-full px-6 flex flex-col items-center">
              <button onClick={() => setIsCoursesOpen(!isCoursesOpen)} className="flex items-center gap-2 hover:text-primary text-lg cursor-pointer transition-colors">
                {nav.coursesDropdown.label} <ChevronDown size={20} className={`transition-transform duration-200 ${isCoursesOpen ? "rotate-180" : ""}`} />
              </button>
              {isCoursesOpen && (
                <div className="flex flex-col items-center gap-4 mt-4 w-full max-w-[200px] bg-white/5 rounded-xl py-4 mx-auto border border-white/5">
                  {courseGroupItems.map((item, i) => (
                    <div key={item.to} className="flex flex-col items-center gap-4 w-full">
                      {i > 0 && <div className="w-12 h-px bg-white/10" />}
                      <Link onClick={closeMobile} to={item.to} className="hover:text-primary text-sm text-gray-300 transition-colors text-center px-2">
                        {item.label}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {otherLinks.map((link) => (
            <Link key={link.to} onClick={closeMobile} to={link.to} className="hover:text-primary text-lg transition-colors">
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
                    <Link onClick={closeMobile} to={item.to} className="hover:text-[#eaa320] text-sm text-gray-300 transition-colors">
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
