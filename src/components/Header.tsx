import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const verificationRef = useRef<HTMLDivElement>(null);
  const coursesRef = useRef<HTMLDivElement>(null);

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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-dark sticky top-0 z-50 w-full h-[100px]">
      <div className="max-w-[1400px] mx-auto w-full h-full flex items-center justify-between px-4 md:px-12">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
          <img
            alt="The Skywaves Educare Logo"
            className="h-[31px] md:h-[41px] object-contain"
            src="https://res.cloudinary.com/dm3scoj2q/image/upload/v1781508181/Landscape_G_Logo_lhy1lo.png"
          />
        </div>
        <nav className="hidden lg:flex gap-8 items-center cursor-pointer text-white">
        <Link to="/" className="font-semibold border-b-2 border-primary pb-1 hover:text-primary transition-all duration-200">
          Home
        </Link>
        <div className="relative z-50 flex items-center" ref={coursesRef}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsCoursesOpen(!isCoursesOpen);
            }}
            className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          >
            Courses <ChevronDown size={14} className={`transition-transform duration-200 ${isCoursesOpen ? "rotate-180" : ""}`} />
          </button>
          
          {isCoursesOpen && (
            <div className="absolute top-[30px] left-0 mt-2 w-56 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden text-sm z-50 border border-gray-100 text-gray-700">
              <Link 
                to="/courses?category=Computer" 
                onClick={() => setIsCoursesOpen(false)}
                className="px-4 py-3 hover:bg-orange-50 hover:text-[#eaa320] hover:pl-5 transition-all duration-200 border-b border-gray-100 font-medium"
              >
                Computer Courses
              </Link>
              <Link 
                to="/courses?category=English" 
                onClick={() => setIsCoursesOpen(false)}
                className="px-4 py-3 hover:bg-orange-50 hover:text-[#eaa320] hover:pl-5 transition-all duration-200 border-b border-gray-100 font-medium"
              >
                English Courses
              </Link>
              <Link 
                to="/courses?category=Fashion" 
                onClick={() => setIsCoursesOpen(false)}
                className="px-4 py-3 hover:bg-orange-50 hover:text-[#eaa320] hover:pl-5 transition-all duration-200 border-b border-gray-100 font-medium"
              >
                Fashion Designing
              </Link>
              <Link 
                to="/courses?category=Boutique" 
                onClick={() => setIsCoursesOpen(false)}
                className="px-4 py-3 hover:bg-orange-50 hover:text-[#eaa320] hover:pl-5 transition-all duration-200 font-medium"
              >
                Boutique Courses
              </Link>
            </div>
          )}
        </div>
        <Link to="/about-us" className="hover:text-primary transition-all duration-200">
          About Us
        </Link>
        <Link to="/contact" className="hover:text-primary transition-all duration-200">
          Contact Us
        </Link>
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
            Verification <ChevronDown size={16} className={`transition-transform duration-200 text-dark ${isVerificationOpen ? "rotate-180" : ""}`} />
          </button>
          
          {isVerificationOpen && (
            <div className="absolute top-[40px] right-0 mt-2 w-56 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden text-sm z-50 border border-gray-100">
              <Link 
                to="/verification" 
                onClick={() => setIsVerificationOpen(false)}
                className="px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-[#eaa320] hover:pl-5 transition-all duration-200 border-b border-gray-100 font-medium"
              >
                Student Verification
              </Link>
              <Link 
                to="/employment-verification" 
                onClick={() => setIsVerificationOpen(false)}
                className="px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-[#eaa320] hover:pl-5 transition-all duration-200 font-medium"
              >
                Employment Verification
              </Link>
            </div>
          )}
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="lg:hidden text-primary p-2 cursor-pointer"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-[100px] left-0 w-full bg-dark flex flex-col items-center gap-6 py-8 lg:hidden shadow-lg border-t border-white/10 text-white z-50 overflow-y-auto max-h-[calc(100vh-100px)]">
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/" className="font-semibold text-lg border-b-2 border-primary pb-1">
            Home
          </Link>
          <div className="w-full px-6 flex flex-col items-center">
            <button 
              onClick={() => setIsCoursesOpen(!isCoursesOpen)}
              className="flex items-center gap-2 hover:text-primary text-lg cursor-pointer transition-colors"
            >
              Courses <ChevronDown size={20} className={`transition-transform duration-200 ${isCoursesOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isCoursesOpen && (
              <div className="flex flex-col items-center gap-4 mt-4 w-full max-w-[200px] bg-white/5 rounded-xl py-4 mx-auto border border-white/5">
                <Link 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  to="/courses?category=Computer" 
                  className="hover:text-primary text-sm text-gray-300 hover:text-center transition-colors"
                >
                  Computer Courses
                </Link>
                <div className="w-12 h-px bg-white/10" />
                <Link 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  to="/courses?category=English" 
                  className="hover:text-primary text-sm text-gray-300 hover:text-center transition-colors"
                >
                  English Courses
                </Link>
                <div className="w-12 h-px bg-white/10" />
                <Link 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  to="/courses?category=Fashion" 
                  className="hover:text-primary text-sm text-gray-300 hover:text-center transition-colors"
                >
                  Fashion Designing
                </Link>
                <div className="w-12 h-px bg-white/10" />
                <Link 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  to="/courses?category=Boutique" 
                  className="hover:text-primary text-sm text-gray-300 hover:text-center transition-colors"
                >
                  Boutique Courses
                </Link>
              </div>
            )}
          </div>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/about-us" className="hover:text-primary text-lg transition-colors">
            About Us
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/contact" className="hover:text-primary text-lg transition-colors">
            Contact Us
          </Link>
          
          <div className="w-full px-6 flex flex-col items-center">
            <button 
              onClick={() => setIsVerificationOpen(!isVerificationOpen)}
              className="flex items-center gap-2 hover:text-[#eaa320] text-lg cursor-pointer transition-colors"
            >
              Verification <ChevronDown size={20} className={`transition-transform duration-200 ${isVerificationOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isVerificationOpen && (
              <div className="flex flex-col items-center gap-4 mt-4 w-full max-w-[200px] bg-white/5 rounded-xl py-4 mx-auto border border-white/5">
                <Link 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  to="/verification" 
                  className="hover:text-[#eaa320] text-sm text-gray-300 hover:text-center transition-colors"
                >
                  Student Verification
                </Link>
                <div className="w-12 h-px bg-white/10" />
                <Link 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  to="/employment-verification" 
                  className="hover:text-[#eaa320] text-sm text-gray-300 hover:text-center transition-colors"
                >
                  Employment Verification
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
