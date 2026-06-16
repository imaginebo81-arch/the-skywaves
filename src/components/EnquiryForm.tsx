import { useState, type FormEvent } from "react";
import { Mail, Phone, Send, CheckCircle, Loader2 } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { useMutation } from "../hooks/useApi";
import { publicApi } from "../lib/api/public";

export default function EnquiryForm() {
  const { enquiry } = useContent();
  const { mutate, loading, error } = useMutation(publicApi.submitEnquiry);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", course: "", message: "" });

  const set = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await mutate({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        course: form.course || enquiry.courseOptions[0],
        message: form.message || undefined,
        source: "enquiry",
      });
      setSent(true);
      setForm({ name: "", email: "", phone: "", course: "", message: "" });
    } catch {
      // error surfaced via hook
    }
  };

  const inputClass =
    "w-full rounded-md border border-gray-200 bg-white p-3 outline-none focus:border-[#eaa320] focus:ring-1 focus:ring-[#eaa320] transition-colors text-sm";

  return (
    <section className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-16">
      <div className="w-full flex flex-col md:flex-row gap-12 lg:gap-24">
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{enquiry.heading}</h2>
          <p className="text-gray-600 mb-10 text-base md:text-lg max-w-sm">{enquiry.subheading}</p>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 text-gray-900 font-semibold">
              <div className="text-[#eaa320]"><Mail size={24} /></div>
              <span className="text-lg">{enquiry.email}</span>
            </div>
            <div className="flex items-center gap-4 text-gray-900 font-semibold">
              <div className="text-[#eaa320]"><Phone size={24} /></div>
              <span className="text-lg">{enquiry.phone}</span>
            </div>
          </div>
        </div>
        <div className="flex-[1.5]">
          {sent ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-12">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Message Sent</h3>
              <p className="text-gray-600">Thank you for reaching out. Our team will get back to you shortly.</p>
              <button onClick={() => setSent(false)} className="btn-primary px-6 py-2.5 cursor-pointer">Send Another</button>
            </div>
          ) : (
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
                  <input required className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} type="text" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                  <input className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} type="email" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Phone</label>
                  <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} type="tel" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Course of Interest</label>
                  <select className={`${inputClass} text-gray-900`} value={form.course} onChange={(e) => set("course", e.target.value)}>
                    {enquiry.courseOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Message</label>
                <textarea className={`${inputClass} h-32 resize-none`} value={form.message} onChange={(e) => set("message", e.target.value)} />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div>
                <button disabled={loading} className="bg-[#eaa320] hover:bg-[#de9b1f] text-gray-900 py-3 px-8 rounded-md font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-60" type="submit">
                  {loading ? "Sending..." : "Send Message"}
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
