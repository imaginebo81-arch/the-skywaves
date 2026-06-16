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
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const set = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await mutate({ name: form.name, email: form.email, message: form.message, source: "contact" });
      setSent(true);
      setForm({ name: "", email: "", message: "" });
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

      <section className="rounded-[24px] p-6 md:p-16 text-center shadow-sm overflow-hidden relative flex flex-col justify-center min-h-[250px] md:min-h-[300px] bg-dark">
        <div className="relative z-20">
          <h1 className="font-display-md text-display-md text-white mb-4">{contact.heading}</h1>
          <p className="text-white/90 font-body-lg text-body-lg max-w-2xl mx-auto">{contact.subheading}</p>
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
                  <label className="text-sm font-label-sm text-on-surface-variant">Name</label>
                  <input required className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} type="text" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-label-sm text-on-surface-variant">Email</label>
                  <input required className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} type="email" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-label-sm text-on-surface-variant">Message</label>
                <textarea required className={`${inputClass} h-32 resize-none`} value={form.message} onChange={(e) => set("message", e.target.value)} />
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
