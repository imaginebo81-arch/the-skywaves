import { CheckCircle, BriefcaseBusiness } from "lucide-react";
import React, { useState } from "react";

export default function EmploymentVerification() {
  const [verified, setVerified] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerified(true);
  };

  if (verified) {
    return (
      <section className="bento-card p-6 md:p-12 bg-surface-container-lowest max-w-4xl mx-auto w-full text-center flex flex-col items-center gap-8">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
          <CheckCircle size={40} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Verification Successful
          </h2>
          <p className="text-gray-600 text-lg">
            Record found. The employment details are displayed below.
          </p>
        </div>

        <div className="w-full max-w-2xl border border-gray-200 rounded-[24px] p-8 md:p-12 relative overflow-hidden bg-white shadow-sm mt-4 text-left">
          {/* Certificate decorative borders */}
          <div className="absolute top-0 left-0 w-full h-4 bg-[#eaa320]"></div>
          <div className="absolute bottom-0 left-0 w-full h-4 bg-[#eaa320]"></div>
          
          <div className="flex flex-col items-center text-center gap-6 relative z-10 border-4 border-double border-gray-100 p-8">
            <BriefcaseBusiness className="text-[#eaa320] w-16 h-16" />
            
            <div className="space-y-4 w-full border-b border-gray-100 pb-8">
              <h3 className="font-serif text-3xl font-bold text-gray-900 uppercase tracking-widest">
                Certificate of Employment
              </h3>
              <p className="text-gray-500 uppercase tracking-widest text-sm">
                Skywaves Educare Administration
              </p>
            </div>

            <div className="space-y-4 pt-4 w-full text-center">
              <p className="text-gray-600 italic text-lg">This is to certify that</p>
              <h4 className="font-serif text-4xl font-bold text-gray-900">
                Priya Sharma
              </h4>
              <p className="text-gray-600 text-lg mt-4 max-w-md mx-auto">
                was employed with us as a <strong>Senior Faculty Member</strong> from August 2021 to Present, rendering dedicated and exceptional service.
              </p>
            </div>

            <div className="flex justify-between items-end w-full mt-12 px-8">
              <div className="text-left border-t border-gray-300 pt-2 w-32">
                <p className="text-gray-900 font-bold text-sm">15 Jun 2026</p>
                <p className="text-gray-500 text-xs">Date</p>
              </div>
              <div className="text-right border-t border-gray-300 pt-2 w-32">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_of_John_Hancock.svg" alt="Signature" className="h-8 mx-auto -mt-6 mb-1 opacity-50 block" />
                <p className="text-gray-900 font-bold text-sm">HR Manager</p>
                <p className="text-gray-500 text-xs">Skywaves Educare</p>
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => setVerified(false)} className="btn-primary px-8 py-3 font-title-md text-title-md mt-4 cursor-pointer">
          Verify Another Record
        </button>
      </section>
    );
  }

  return (
    <section className="bento-card p-6 md:p-12 bg-surface-container-lowest max-w-3xl mx-auto w-full">
      <div className="mb-8 border-b border-outline-variant pb-6 text-center md:text-left">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Employment Verification
        </h2>
        <p className="text-gray-600 text-lg">
          Please enter the employee's date of birth and reference number to view their employment records.
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-label-sm text-on-surface-variant font-medium">
            Date of Birth
          </label>
          <input
            required
            className="w-full rounded-[10px] border border-outline-variant bg-surface-container-lowest focus:ring-[#eaa320] focus:border-[#eaa320] p-4 outline-none text-lg"
            type="date"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-label-sm text-on-surface-variant font-medium">
            Employment Reference Number
          </label>
          <input
            required
            className="w-full rounded-[10px] border border-outline-variant bg-surface-container-lowest focus:ring-[#eaa320] focus:border-[#eaa320] p-4 outline-none text-lg tracking-wider"
            placeholder="e.g. SKY-EMP-4091"
            type="text"
          />
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="btn-primary w-full py-4 text-xl font-bold cursor-pointer transition-transform active:scale-95"
          >
            Verify Employment
          </button>
        </div>
      </form>
    </section>
  );
}
