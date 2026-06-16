import { CheckCircle, BriefcaseBusiness, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import { useContent } from "../context/ContentContext";
import { useMutation } from "../hooks/useApi";
import { publicApi } from "../lib/api/public";
import type { EmployeeVerification as EmployeeVerificationData } from "../lib/api/types";

function formatDate(value: string | null): string {
  if (!value) return "Present";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function EmploymentVerification() {
  const { verification, meta } = useContent();
  const cfg = verification.employee;
  const { mutate, loading, error } = useMutation(publicApi.verifyEmployee);
  const [data, setData] = useState<EmployeeVerificationData | null>(null);
  const [ref, setRef] = useState("");
  const [dob, setDob] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setData(await mutate(ref.trim(), dob));
    } catch {
      // error surfaced via hook
    }
  };

  if (data) {
    const emp = data.employee;
    return (
      <section className="bento-card p-6 md:p-12 bg-surface-container-lowest max-w-4xl mx-auto w-full text-center flex flex-col items-center gap-8">
        <Helmet>
          <title>Employment Verified - Skywaves Educare</title>
        </Helmet>
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
          <CheckCircle size={40} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Verification Successful</h2>
          <p className="text-gray-600 text-lg">Record found. The employment details are displayed below.</p>
        </div>

        <div className="w-full max-w-2xl border border-gray-200 rounded-[24px] p-8 md:p-12 relative overflow-hidden bg-white shadow-sm mt-4 text-left">
          <div className="absolute top-0 left-0 w-full h-4 bg-[#eaa320]"></div>
          <div className="absolute bottom-0 left-0 w-full h-4 bg-[#eaa320]"></div>

          <div className="flex flex-col items-center text-center gap-6 relative z-10 border-4 border-double border-gray-100 p-8">
            <BriefcaseBusiness className="text-[#eaa320] w-16 h-16" />
            <div className="space-y-4 w-full border-b border-gray-100 pb-8">
              <h3 className="font-serif text-3xl font-bold text-gray-900 uppercase tracking-widest">Certificate of Employment</h3>
              <p className="text-gray-500 uppercase tracking-widest text-sm">{meta.orgName} Administration</p>
            </div>

            <div className="space-y-4 pt-4 w-full text-center">
              <h4 className="font-serif text-4xl font-bold text-gray-900">{emp.name}</h4>
              <p className="text-gray-600 text-lg mt-4 max-w-lg mx-auto">{data.certificateText}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-sm text-left mt-6 border-t border-gray-100 pt-6">
              <Detail label="Father Name" value={emp.fatherName ?? "-"} />
              <Detail label="Date of Birth" value={formatDate(emp.dateOfBirth)} />
              <Detail label="Designation" value={emp.designation ?? "-"} />
              <Detail label="Joining Date" value={formatDate(emp.joiningDate)} />
              {!emp.isCurrentlyWorking && <Detail label="Leaving Date" value={formatDate(emp.leavingDate)} />}
              <Detail label="Address" value={emp.address ?? "-"} />
            </div>
          </div>
        </div>

        <button onClick={() => setData(null)} className="btn-primary px-8 py-3 font-title-md text-title-md mt-4 cursor-pointer">
          Verify Another Record
        </button>
      </section>
    );
  }

  return (
    <section className="bento-card p-6 md:p-12 bg-surface-container-lowest max-w-3xl mx-auto w-full">
      <Helmet>
        <title>Employment Verification - Skywaves Educare</title>
        <meta name="description" content="Verify the employment records of Skywaves Educare faculty and staff efficiently." />
      </Helmet>
      <div className="mb-8 border-b border-outline-variant pb-6 text-center md:text-left">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{cfg.heading}</h2>
        <p className="text-gray-600 text-lg">{cfg.description}</p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-label-sm text-on-surface-variant font-medium">Date of Birth</label>
          <input
            required
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full rounded-[10px] border border-outline-variant bg-surface-container-lowest focus:ring-[#eaa320] focus:border-[#eaa320] p-4 outline-none text-lg"
            type="date"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-label-sm text-on-surface-variant font-medium">{cfg.refLabel}</label>
          <input
            required
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            className="w-full rounded-[10px] border border-outline-variant bg-surface-container-lowest focus:ring-[#eaa320] focus:border-[#eaa320] p-4 outline-none text-lg tracking-wider"
            placeholder={cfg.refPlaceholder}
            type="text"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="mt-8">
          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-xl font-bold cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 size={20} className="animate-spin" />}
            {loading ? "Verifying..." : "Verify Employment"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-gray-500 text-xs uppercase tracking-wide">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
