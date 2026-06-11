import { Mail, Phone } from "lucide-react";

export default function EnquiryForm() {
  return (
    <section className="bento-card p-8 md:p-12 bg-surface-container-lowest">
      <div className="w-full flex flex-col md:flex-row gap-12">
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">
            Have Questions?
          </h2>
          <p className="text-on-surface-variant font-body-md text-body-md mb-8">
            Reach out to our admissions team. We're here to help you find the right
            path for your future.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <Mail className="text-primary" size={24} />
              <span>admissions@skywaveseducare.com</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant">
              <Phone className="text-primary" size={24} />
              <span>+91 800 555 0199</span>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-label-sm text-on-surface-variant mb-1">
                  Name
                </label>
                <input
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-primary focus:border-primary p-2 outline-none"
                  placeholder="Rohit Kumar"
                  type="text"
                />
              </div>
              <div>
                <label className="block text-sm font-label-sm text-on-surface-variant mb-1">
                  Email
                </label>
                <input
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-primary focus:border-primary p-2 outline-none"
                  placeholder="rohit@example.com"
                  type="email"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-label-sm text-on-surface-variant mb-1">
                  Phone
                </label>
                <input
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-primary focus:border-primary p-2 outline-none"
                  placeholder="+91 98765 43210"
                  type="tel"
                />
              </div>
              <div>
                <label className="block text-sm font-label-sm text-on-surface-variant mb-1">
                  Course of Interest
                </label>
                <select className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-primary focus:border-primary text-on-surface p-2 outline-none">
                  <option>Computer Science</option>
                  <option>Language Mastery</option>
                  <option>Fashion Design</option>
                  <option>Hypnotherapy</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-label-sm text-on-surface-variant mb-1">
                Message
              </label>
              <textarea
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-primary focus:border-primary p-2 outline-none h-32 resize-none"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <button
              className="btn-primary py-3 font-title-md text-title-md w-full mt-2"
              type="submit"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
