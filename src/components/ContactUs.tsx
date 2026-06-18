import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useContent } from "../context/ContentContext";
import { useMutation } from "../hooks/useApi";
import { publicApi } from "../lib/api/public";

export default function ContactUs() {
  const { contact } = useContent();
  const { mutate, loading, error } = useMutation(publicApi.submitEnquiry);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const set = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await mutate({ name: form.name, email: form.email, phone: form.phone || undefined, message: form.message, source: "contact" });
      setSent(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      // error surfaced via hook
    }
  };

  const inputClass =
    "w-full rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-primary focus:border-primary p-3 outline-none";

  return (
    <div className="flex flex-col gap-section-margin">
      <Helmet>
        <title>{contact.title}</title>
        <meta name="description" content={contact.description} />
      </Helmet>

      <section className="rounded-[24px] overflow-hidden relative flex flex-col justify-center min-h-[340px] md:min-h-[420px]">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2000&auto=format&fit=crop"
            alt="Contact Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#151b23]/90 via-[#151b23]/75 to-[#0f2744]/80" />
        </div>
        <div className="relative z-10 text-center px-6 py-16 md:py-20">
          <span className="inline-block text-xs font-bold text-[#eaa320] uppercase tracking-[3px] mb-4">Get In Touch</span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-5 leading-tight tracking-tight">
            {contact.heading}
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">{contact.subheading}</p>
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="w-12 h-1 bg-[#eaa320] rounded-full" />
            <div className="w-3 h-3 rounded-full bg-[#eaa320]" />
            <div className="w-12 h-1 bg-[#eaa320] rounded-full" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="bento-card p-6 md:p-12 bg-surface-container-lowest flex flex-col justify-between h-full">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-background mb-6">Get in Touch</h2>
            <div className="flex flex-col gap-6 mb-10">
              <div className="flex items-start gap-4 text-on-surface-variant">
                <MapPin className="text-primary mt-1 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-title-md text-on-surface mb-1">{contact.locationHeading}</h3>
                  {contact.addressLines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 text-on-surface-variant">
                <Mail className="text-primary flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-title-md text-on-surface mb-1">{contact.emailHeading}</h3>
                  <p>{contact.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-on-surface-variant">
                <Phone className="text-primary flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-title-md text-on-surface mb-1">{contact.phoneHeading}</h3>
                  <p>{contact.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {sent ? (
            <div className="flex flex-col items-center text-center gap-3 mt-auto py-8">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle size={30} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Message Sent</h3>
              <p className="text-gray-600 text-sm">We will get back to you shortly.</p>
              <button onClick={() => setSent(false)} className="btn-primary px-6 py-2.5 cursor-pointer">Send Another</button>
            </div>
          ) : (
            <form className="flex flex-col gap-4 mt-auto" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-label-sm text-on-surface-variant">Name <span className="text-red-500">*</span></label>
                  <input required className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} type="text" placeholder="Your full name" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-label-sm text-on-surface-variant">Email <span className="text-red-500">*</span></label>
                  <input required className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} type="email" placeholder="your@email.com" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-label-sm text-on-surface-variant">Phone Number</label>
                <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} type="tel" placeholder="+91 98765 43210" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-label-sm text-on-surface-variant">Message <span className="text-red-500">*</span></label>
                <textarea required className={`${inputClass} h-32 resize-none`} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Tell us about your enquiry or the course you're interested in..." />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button disabled={loading} className="btn-primary py-4 font-title-md text-title-md w-full mt-2 cursor-pointer disabled:opacity-60" type="submit">
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </section>

        <section className="bento-card overflow-hidden h-[300px] md:min-h-[400px] lg:h-full lg:min-h-[500px]">
          <iframe
            src={contact.mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full grayscale-[20%] contrast-125 opacity-90"
          ></iframe>
        </section>
      </div>
    </div>
  );
}
