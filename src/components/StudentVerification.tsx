import { UploadCloud, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function StudentVerification() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="bento-card p-6 md:p-16 bg-surface-container-lowest max-w-3xl mx-auto w-full text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-primary-container text-primary rounded-full flex items-center justify-center">
          <CheckCircle size={40} />
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-background">
          Verification Submitted
        </h2>
        <p className="text-on-surface-variant font-body-lg text-body-lg">
          Your details have been submitted successfully. Our team will review your documents and get back to you shortly.
        </p>
        <button onClick={() => setSubmitted(false)} className="btn-primary px-8 py-3 font-title-md text-title-md mt-4 cursor-pointer">
          Submit Another Request
        </button>
      </section>
    );
  }

  return (
    <section className="bento-card p-6 md:p-12 bg-surface-container-lowest max-w-4xl mx-auto w-full">
      <div className="mb-8 border-b border-outline-variant pb-6">
        <h2 className="font-headline-lg text-headline-lg text-on-background mb-2">
          Student Verification
        </h2>
        <p className="text-on-surface-variant font-body-md text-body-md">
          Please fill out the form below and upload your documents for academic verification.
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-label-sm text-on-surface-variant">
              Full Name
            </label>
            <input
              required
              className="w-full rounded-[10px] border border-outline-variant bg-surface-container-lowest focus:ring-primary focus:border-primary p-3 outline-none"
              placeholder="e.g. Rohit Kumar"
              type="text"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-label-sm text-on-surface-variant">
              Phone Number
            </label>
            <input
              required
              className="w-full rounded-[10px] border border-outline-variant bg-surface-container-lowest focus:ring-primary focus:border-primary p-3 outline-none"
              placeholder="+91 98765 43210"
              type="tel"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-label-sm text-on-surface-variant">
            Higher Education Studied (Degree/Course)
          </label>
          <input
            required
            className="w-full rounded-[10px] border border-outline-variant bg-surface-container-lowest focus:ring-primary focus:border-primary p-3 outline-none"
            placeholder="e.g. B.Tech in Computer Science"
            type="text"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-label-sm text-on-surface-variant">
              Started Year
            </label>
            <input
              required
              className="w-full rounded-[10px] border border-outline-variant bg-surface-container-lowest focus:ring-primary focus:border-primary p-3 outline-none"
              placeholder="YYYY"
              type="number"
              min="1980"
              max="2030"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-label-sm text-on-surface-variant">
              Passing Year
            </label>
            <input
              required
              className="w-full rounded-[10px] border border-outline-variant bg-surface-container-lowest focus:ring-primary focus:border-primary p-3 outline-none"
              placeholder="YYYY"
              type="number"
              min="1980"
              max="2030"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-label-sm text-on-surface-variant">
              Upload Your Image
            </label>
            <div className="border-2 border-dashed border-outline-variant rounded-[10px] p-6 flex flex-col items-center justify-center text-center hover:bg-surface-container-high transition-colors cursor-pointer relative overflow-hidden bg-surface-container-lowest">
              <input type="file" required accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <UploadCloud className="text-primary mb-2 w-8 h-8 pointer-events-none" />
              <p className="font-label-sm text-sm text-on-surface pointer-events-none">Click or drag image here</p>
              <p className="text-xs text-on-surface-variant mt-1 pointer-events-none">PNG, JPG up to 5MB</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-label-sm text-on-surface-variant">
              Upload DMC / Diploma / Marksheet
            </label>
            <div className="border-2 border-dashed border-outline-variant rounded-[10px] p-6 flex flex-col items-center justify-center text-center hover:bg-surface-container-high transition-colors cursor-pointer relative overflow-hidden bg-surface-container-lowest">
              <input type="file" required accept=".pdf,image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <UploadCloud className="text-secondary mb-2 w-8 h-8 pointer-events-none" />
              <p className="font-label-sm text-sm text-on-surface pointer-events-none">Click or drag document here</p>
              <p className="text-xs text-on-surface-variant mt-1 pointer-events-none">PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-outline-variant pt-6">
          <button
            type="submit"
            className="btn-primary w-full py-4 font-title-md text-title-md cursor-pointer"
          >
            Submit for Verification
          </button>
        </div>
      </form>
    </section>
  );
}
