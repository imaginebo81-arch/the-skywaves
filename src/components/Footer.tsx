export default function Footer() {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface font-body-md text-body-md w-full px-4 md:px-[80px] py-section-margin flex flex-col gap-12 mt-section-margin border-t border-outline/30">
      <div className="flex flex-col md:flex-row justify-between items-start gap-bento-gap">
        <div className="flex flex-col gap-4 items-center md:items-start max-w-sm">
          <img
            alt="The Skywaves Educare Logo"
            className="h-[62px] object-contain"
            src="https://res.cloudinary.com/dm3scoj2q/image/upload/v1781174348/Landscape_G_Logo_lhy1lo.png"
          />
          <p className="text-inverse-on-surface/80 font-body-md text-body-md text-sm text-center md:text-left">
            Elevating knowledge, inspiring minds. Join our community of learners to create a better future.
          </p>
        </div>
        
        <div className="w-full md:w-1/3 h-48 rounded-[12px] overflow-hidden border border-outline/30 bg-surface-container-high">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113941.74201389088!2d-122.42067980312645!3d37.77492951755106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1709664531853!5m2!1sen!2sus" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-outline/30">
        <p className="text-inverse-on-surface/80 font-body-md text-body-md text-sm">
          © 2024 The Skywaves Educare. Elevating Knowledge.
        </p>
        <nav className="flex flex-wrap justify-center gap-6">
          <a
            className="text-inverse-on-surface/80 hover:text-primary-fixed hover:-translate-y-1 transition-transform transition-all duration-300 text-sm cursor-pointer"
          >
            Privacy Policy
          </a>
          <a
            className="text-inverse-on-surface/80 hover:text-primary-fixed hover:-translate-y-1 transition-transform transition-all duration-300 text-sm cursor-pointer"
          >
            Terms of Service
          </a>
          <a
            className="text-inverse-on-surface/80 hover:text-primary-fixed hover:-translate-y-1 transition-transform transition-all duration-300 text-sm cursor-pointer"
          >
            Contact Us
          </a>
          <a
            className="text-inverse-on-surface/80 hover:text-primary-fixed hover:-translate-y-1 transition-transform transition-all duration-300 text-sm cursor-pointer"
          >
            Careers
          </a>
        </nav>
      </div>
    </footer>
  );
}
