import { Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-dark text-white w-full border-t border-white/10">
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-12 py-16 flex flex-col gap-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-start">
          <div className="flex flex-col gap-6 md:col-span-2 max-w-sm">
            <img
              alt="The Skywaves Educare Logo"
              className="h-[49px] object-contain object-left"
              src="https://res.cloudinary.com/dm3scoj2q/image/upload/v1781508181/Landscape_G_Logo_lhy1lo.png"
            />
            <p className="text-gray-300 text-sm leading-relaxed">
              Elevating knowledge, inspiring minds.<br/>Join our community of learners to<br/>create a better future.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center hover:bg-[#eaa320] hover:text-black hover:border-[#eaa320] transition-colors"><Facebook size={16} /></a>
              <a href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center hover:bg-[#eaa320] hover:text-black hover:border-[#eaa320] transition-colors"><Twitter size={16} /></a>
              <a href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center hover:bg-[#eaa320] hover:text-black hover:border-[#eaa320] transition-colors"><Linkedin size={16} /></a>
              <a href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center hover:bg-[#eaa320] hover:text-black hover:border-[#eaa320] transition-colors"><Instagram size={16} /></a>
              <a href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center hover:bg-[#eaa320] hover:text-black hover:border-[#eaa320] transition-colors"><Youtube size={16} /></a>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-white mb-2 text-lg">Quick Links</h3>
            <Link to="/" className="text-gray-300 hover:text-[#eaa320] transition-colors text-sm font-medium">Home</Link>
            <Link to="/about-us" className="text-gray-300 hover:text-[#eaa320] transition-colors text-sm font-medium">About Us</Link>
            <Link to="/contact" className="text-gray-300 hover:text-[#eaa320] transition-colors text-sm font-medium">Contact Us</Link>
            <Link to="/verification" className="text-gray-300 hover:text-[#eaa320] transition-colors text-sm font-medium">Student Verification</Link>
            <Link to="/employment-verification" className="text-gray-300 hover:text-[#eaa320] transition-colors text-sm font-medium">Employment Verification</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-white mb-2 text-lg">Courses</h3>
            <Link to="/courses?category=Computer" className="text-gray-300 hover:text-[#eaa320] transition-colors text-sm font-medium">Computer Courses</Link>
            <Link to="/courses?category=English" className="text-gray-300 hover:text-[#eaa320] transition-colors text-sm font-medium">English Courses</Link>
            <Link to="/courses?category=Fashion" className="text-gray-300 hover:text-[#eaa320] transition-colors text-sm font-medium">Fashion Designing</Link>
            <Link to="/courses?category=Boutique" className="text-gray-300 hover:text-[#eaa320] transition-colors text-sm font-medium">Boutique Courses</Link>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-12 py-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-400 text-sm">
          © 2024 The Skywaves Educare. Elevating Knowledge.
        </p>
        <nav className="flex flex-wrap justify-center gap-6">
          <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Privacy Policy</Link>
          <Link to="/terms-of-service" className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Terms of Service</Link>
          <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Contact Us</Link>
          <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Admin</a>
        </nav>
      </div>
    </footer>
  );
}
