import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-inverse-surface border-b border-outline/30 sticky top-0 z-50 flex items-center justify-between px-4 md:px-[80px] py-4 w-full">
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
        <img
          alt="The Skywaves Educare Logo"
          className="h-[52px] object-contain"
          src="https://res.cloudinary.com/dm3scoj2q/image/upload/v1781174348/Landscape_G_Logo_lhy1lo.png"
        />
      </div>
      <nav className="hidden md:flex gap-8 items-center cursor-pointer">
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
          className="btn-primary px-6 py-2 font-title-md text-title-md hidden md:block whitespace-nowrap cursor-pointer"
        >
          Student Verification
        </button>
        <button className="md:hidden text-primary-fixed">
          {/* Menu icon placeholder or from lucide */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </div>
    </header>
  );
}
