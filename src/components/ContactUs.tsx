import { Mail, Phone, MapPin } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function ContactUs() {
  return (
    <div className="flex flex-col gap-section-margin">
      <Helmet>
        <title>Contact Us - Skywaves Educare</title>
        <meta name="description" content="Get in touch with Skywaves Educare for admissions, inquiries, or any educational guidance. We're here to help." />
      </Helmet>
      {/* Header section */}
      <section 
        className="rounded-[24px] p-6 md:p-16 text-center shadow-sm overflow-hidden relative flex flex-col justify-center min-h-[250px] md:min-h-[300px] bg-dark"
      >
        <div className="relative z-20">
          <h1 className="font-display-md text-display-md text-white mb-4">
            Contact Us
          </h1>
          <p className="text-white/90 font-body-lg text-body-lg max-w-2xl mx-auto">
            We would love to hear from you. Reach out to our team for any inquiries, admissions details, or just to say hello.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information & Form */}
        <section className="bento-card p-6 md:p-12 bg-surface-container-lowest flex flex-col justify-between h-full">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-background mb-6">
              Get in Touch
            </h2>
            <div className="flex flex-col gap-6 mb-10">
              <div className="flex items-start gap-4 text-on-surface-variant">
                <MapPin className="text-primary mt-1 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-title-md text-on-surface mb-1">Our Location</h3>
                  <p>123 Education Lane, Knowledge Park</p>
                  <p>New Delhi, Delhi 110001, India</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-on-surface-variant">
                <Mail className="text-primary flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-title-md text-on-surface mb-1">Email</h3>
                  <p>admissions@skywaveseducare.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-on-surface-variant">
                <Phone className="text-primary flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-title-md text-on-surface mb-1">Phone</h3>
                  <p>+91 800 555 0199</p>
                </div>
              </div>
            </div>
          </div>

          <form
            className="flex flex-col gap-4 mt-auto"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-label-sm text-on-surface-variant">
                  Name
                </label>
                <input
                  required
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-primary focus:border-primary p-3 outline-none"
                  placeholder="Rohit Kumar"
                  type="text"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-label-sm text-on-surface-variant">
                  Email
                </label>
                <input
                  required
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-primary focus:border-primary p-3 outline-none"
                  placeholder="rohit@example.com"
                  type="email"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-label-sm text-on-surface-variant">
                Message
              </label>
              <textarea
                required
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-primary focus:border-primary p-3 outline-none h-32 resize-none"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <button
              className="btn-primary py-4 font-title-md text-title-md w-full mt-2 cursor-pointer"
              type="submit"
            >
              Send Message
            </button>
          </form>
        </section>

        {/* Map Section */}
        <section className="bento-card overflow-hidden h-[300px] md:min-h-[400px] lg:h-full lg:min-h-[500px]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112000!2d77.1!3d28.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x37205b715389640!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
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
