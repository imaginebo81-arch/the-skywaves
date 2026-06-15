import { Mail, Phone, Send } from "lucide-react";

export default function EnquiryForm() {
  return (
    <section className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-16">
      <div className="w-full flex flex-col md:flex-row gap-12 lg:gap-24">
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Have Questions?
          </h2>
          <p className="text-gray-600 mb-10 text-base md:text-lg max-w-sm">
            Reach out to our admissions team. We're here to help you find the right
            path for your future.
          </p>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 text-gray-900 font-semibold">
              <div className="text-[#eaa320]">
                <Mail size={24} />
              </div>
              <span className="text-lg">admissions@skywaveseducare.com</span>
            </div>
            <div className="flex items-center gap-4 text-gray-900 font-semibold">
              <div className="text-[#eaa320]">
                <Phone size={24} />
              </div>
              <span className="text-lg">+91 800 555 0199</span>
            </div>
          </div>
        </div>
        <div className="flex-[1.5]">
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Name
                </label>
                <input
                  className="w-full rounded-md border border-gray-200 bg-white p-3 outline-none focus:border-[#eaa320] focus:ring-1 focus:ring-[#eaa320] transition-colors text-sm"
                  placeholder="Rohit Kumar"
                  type="text"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email
                </label>
                <input
                  className="w-full rounded-md border border-gray-200 bg-white p-3 outline-none focus:border-[#eaa320] focus:ring-1 focus:ring-[#eaa320] transition-colors text-sm"
                  placeholder="rohit@example.com"
                  type="email"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone
                </label>
                <input
                  className="w-full rounded-md border border-gray-200 bg-white p-3 outline-none focus:border-[#eaa320] focus:ring-1 focus:ring-[#eaa320] transition-colors text-sm"
                  placeholder="+91 98765 43210"
                  type="tel"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Course of Interest
                </label>
                <select className="w-full rounded-md border border-gray-200 bg-white p-3 outline-none focus:border-[#eaa320] focus:ring-1 focus:ring-[#eaa320] transition-colors text-sm text-gray-900">
                  <option>Computer Science</option>
                  <option>Language Mastery</option>
                  <option>Fashion Design</option>
                  <option>Hypnotherapy</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Message
              </label>
              <textarea
                className="w-full rounded-md border border-gray-200 bg-white p-3 outline-none focus:border-[#eaa320] focus:ring-1 focus:ring-[#eaa320] transition-colors text-sm h-32 resize-none"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <div>
              <button
                className="bg-[#eaa320] hover:bg-[#de9b1f] text-gray-900 py-3 px-8 rounded-md font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                type="submit"
              >
                Send Message
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
