import { Monitor, MessageSquare, Briefcase, Brain, ArrowRight, Calendar } from "lucide-react";

export function ComputerScience() {
  return (
    <div className="bento-card p-8 flex flex-col gap-6 bg-gradient-to-b from-blue-50/50 to-white h-full relative group">
      <div className="w-16 h-16 rounded-full border border-blue-100 bg-white flex items-center justify-center shadow-sm">
        <Monitor className="text-blue-600" size={28} />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Computer Science</h3>
        <p className="text-gray-600 text-sm">Master the technologies driving tomorrow.</p>
      </div>
      
      <div className="flex flex-col gap-3 mt-4 flex-grow">
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <div className="flex gap-2 mb-1">
            <span className="font-bold text-xs">CS101</span>
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Beginner</span>
          </div>
          <p className="text-sm font-semibold text-gray-800">Introduction to Programming</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <div className="flex gap-2 mb-1">
            <span className="font-bold text-xs">CS204</span>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Intermediate</span>
          </div>
          <p className="text-sm font-semibold text-gray-800">Data Structures & Algorithms</p>
        </div>
      </div>
      
      <a href="#" className="flex items-center gap-2 text-sm font-bold text-gray-800 mt-auto justify-center hover:text-blue-600 transition-colors">
        View all courses <ArrowRight size={16} />
      </a>
    </div>
  );
}

export function LanguageMastery() {
  return (
    <div className="bento-card p-8 flex flex-col gap-6 bg-gradient-to-b from-green-50/50 to-white h-full relative group">
      <div className="w-16 h-16 rounded-full border border-green-100 bg-white flex items-center justify-center shadow-sm">
        <MessageSquare className="text-green-600" size={28} />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Language Mastery</h3>
        <p className="text-gray-600 text-sm">Connect with the world through words.</p>
      </div>
      
      <div className="flex flex-col gap-3 mt-4 flex-grow">
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <div className="flex gap-2 mb-1">
            <span className="font-bold text-xs">LNG301</span>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">Advanced</span>
          </div>
          <p className="text-sm font-semibold text-gray-800">Creative Writing Workshop</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <div className="flex gap-2 mb-1">
            <span className="font-bold text-xs">LNG102</span>
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Japanese Level 1</span>
          </div>
          <p className="text-sm font-semibold text-gray-800">Japanese Language</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <div className="flex gap-2 mb-1">
            <span className="font-bold text-xs">LNG205</span>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Conversational French</span>
          </div>
          <p className="text-sm font-semibold text-gray-800">French Language</p>
        </div>
      </div>
      
      <a href="#" className="flex items-center gap-2 text-sm font-bold text-gray-800 mt-auto justify-center hover:text-green-600 transition-colors">
        View all courses <ArrowRight size={16} />
      </a>
    </div>
  );
}

export function FashionDesign() {
  return (
    <div className="bento-card p-8 flex flex-col gap-6 bg-gradient-to-b from-orange-50/50 to-white h-full relative group">
      <div className="w-16 h-16 rounded-full border border-orange-100 bg-white flex items-center justify-center shadow-sm">
        {/* Placeholder for dress form, using briefcase as stand-in or maybe PenTool but let's use a standard one. Actually, 'Shirt' or generic is fine. */}
        <Briefcase className="text-orange-600" size={28} />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Fashion Design</h3>
        <p className="text-gray-600 text-sm">From concept sketches to runway execution.</p>
      </div>
      
      <div className="flex items-center justify-center mt-4 flex-grow">
        <div className="flex items-center space-x-[-12px]">
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-200 shadow-sm">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDC8B9BOwXK6V1gOpr8534wSEyZpH7Jh9l9LQ4p78m75-fu9EmSvbLUTWQx3PTU8gruSDTS9Kz7bx4qoHv0H9w9a7d8zGg4pClvTNfBGOXxc8tkzx9pbv4PNhVCEVmNrLo--px0iYBqH2kcQjsSHdhaWbAI4EG-Qs3m2vwJfIc4RlgB_bKcpuHj6NbbofNakShLD0rACbjip7bHKhuMhygGSkj6jMZlxLY_hlNWiTV_08FVwfyJflToBWSy37YfkmCMQVowmcxrv7U" alt="Student" className="w-full h-full object-cover" />
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-200 shadow-sm">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpIUEy6vyYHP8wOlDt3EqFFgEW70AB929Wa9DuAPkFTPW1XlYt6xCzf-lc5GxdFvX230krPCbUuiITKrK4cQLL6GH2FPToL1N__3nhJw7wZpTfi0tybUqp8MKqTzURRFWETv7WS9Iuhy-USQbzFbaVNR-fLv3CDEEnbDt843DC5j5YZza2IenztyfWQMm5iFm0HjC3o8XYAyBQ6vwIQlYg93X3HnYllqhL--zWF9gr3YFTSTX1L5Hk5JxZ-XpxwLa-8iYNfi1kPIs" alt="Student" className="w-full h-full object-cover" />
          </div>
           <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-200 shadow-sm">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuChgk5SMT9oqNKPMXPVwNPkVG8ESRzWoue7FEY6V4kMKdehiOxHJsgwJgJzLEzirQ--7GlOJWZmLL1VfgPhTQCbKj165MS6QAT1Eo3D5MOA9h7Xim541nQv69Hntn4ftbZOSflqwKbshgEy81iTw-k8zhajJB4QAHhSngJsGwbwy58y2LAjrka5HdFwM8W9QDxQXgAAYgLKGaNELbj0tCGasm-Zy2ACXj3nCLz-8ITxEd64seme27W6HpazMI2oH-V2JKsVB5eYLr8" alt="Student" className="w-full h-full object-cover" />
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-white bg-white flex items-center justify-center text-sm font-bold text-gray-700 shadow-sm">
            +42
          </div>
        </div>
      </div>
      
      <button className="btn-primary w-full py-4 mt-auto">
        Enroll Now
      </button>
    </div>
  );
}

export function HypnotherapyCertification() {
  return (
    <div className="bento-card p-8 flex flex-col gap-6 bg-gradient-to-b from-purple-50/50 to-white h-full relative group">
      <div className="w-16 h-16 rounded-full border border-purple-100 bg-white flex items-center justify-center shadow-sm">
        <Brain className="text-purple-600" size={28} />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Hypnotherapy Certification</h3>
        <p className="text-gray-600 text-sm">Unlock the power of the subconscious mind.</p>
      </div>
      
      <div className="flex flex-col justify-center mt-4 flex-grow">
        <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Next Cohort</p>
            <p className="text-lg font-bold text-gray-900">September 15th</p>
          </div>
          <Calendar className="text-gray-400" size={32} />
        </div>
      </div>
      
      <button className="btn-primary w-full py-4 mt-auto">
        Enroll Now
      </button>
    </div>
  );
}
