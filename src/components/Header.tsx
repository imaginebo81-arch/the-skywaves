import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-inverse-surface border-b border-outline/30 sticky top-0 z-50 flex items-center justify-between px-4 md:px-[80px] py-4 w-full lg:h-auto h-[84px]">
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
        <img
          alt="The Skywaves Educare Logo"
          className="h-[40px] md:h-[52px] object-contain"
          src="https://res.cloudinary.com/dm3scoj2q/image/upload/v1781174348/Landscape_G_Logo_lhy1lo.png"
        />
      </div>
      <nav className="hidden lg:flex gap-8 items-center cursor-pointer">
        <Link to="/" className="text-secondary-fixed font-bold border-b-2 border-secondary-fixed pb-1 hover:scale-105 active:scale-95 transition-all duration-200">
          Home
        </Link>
        <Link to="/" className="text-inverse-on-surface hover:text-primary-fixed hover:scale-105 active:scale-95 transition-all duration-200">
          Courses
        </Link>
        <Link to="/" className="text-inverse-on-surface hover:text-primary-fixed hover:scale-105 active:scale-95 transition-all duration-200">
          About us
        </Link>
        <Link to="/contact" className="text-inverse-on-surface hover:text-primary-fixed hover:scale-105 active:scale-95 transition-all duration-200">
          Contact us
        </Link>
      </nav>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate("/verification")}
          className="btn-primary px-6 py-2 font-title-md text-title-md hidden lg:block whitespace-nowrap cursor-pointer"
        >
          Student Verification
        </button>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="lg:hidden text-primary-fixed p-2"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-[84px] left-0 w-full bg-inverse-surface border-b border-outline/30 flex flex-col items-center gap-6 py-8 lg:hidden shadow-lg">
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/" className="text-secondary-fixed font-bold text-lg border-b-2 border-secondary-fixed pb-1">
            Home
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/" className="text-inverse-on-surface hover:text-primary-fixed text-lg">
            Courses
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/" className="text-inverse-on-surface hover:text-primary-fixed text-lg">
            About us
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/contact" className="text-inverse-on-surface hover:text-primary-fixed text-lg">
            Contact us
          </Link>
          <button 
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate("/verification");
            }}
            className="btn-primary w-[80%] py-3 font-title-md text-title-md mt-4 cursor-pointer"
          >
            Student Verification
          </button>
        </div>
      )}
    </header>
  );
}
