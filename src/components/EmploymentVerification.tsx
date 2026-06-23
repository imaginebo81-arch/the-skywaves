import { CheckCircle, Loader2 } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useContent } from "../context/ContentContext";
import { useMutation } from "../hooks/useApi";
import { publicApi } from "../lib/api/public";
import type { EmployeeVerification as EmployeeVerificationData } from "../lib/api/types";
import { formatDate as _fmtDate } from "../lib/dateUtils";

function formatDate(value: string | null): string {
  return _fmtDate(value, "Currently Working");
}

export default function EmploymentVerification() {
  const { verification, meta } = useContent();
  const cfg = verification.employee;
  const { mutate, loading, error } = useMutation(publicApi.verifyEmployee);
  const [data, setData] = useState<EmployeeVerificationData | null>(null);
  const [ref, setRef] = useState("");
  const [name, setName] = useState("");
  const location = useLocation();

  useEffect(() => {
    setData(null);
  }, [location.key]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setData(await mutate(ref.trim(), name.trim()));
    } catch {
      // error surfaced via hook
    }
  };

  if (data) {
    const emp = data.employee;
    const hasMarkdown = !!data.certificateMarkdown?.trim();
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 max-w-4xl mx-auto w-full flex flex-col items-center gap-6">
        <Helmet>
          <title>Employment Verified - Skywaves Educare</title>
        </Helmet>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle size={32} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Verification Successful</h2>
            <p className="text-gray-500 text-sm md:text-base">Record found. The employment details are displayed below.</p>
          </div>
        </div>

        <button onClick={() => setData(null)} className="btn-primary px-6 py-2.5 font-bold cursor-pointer text-sm">
          ← Verify Another Record
        </button>

        <div className="w-full rounded-2xl overflow-hidden bg-white shadow-md text-left border border-gray-100">
          {/* Certificate header */}
          <div className="bg-[#151b23] text-white px-4 py-4 sm:px-8 sm:py-5 flex flex-wrap items-start sm:items-center gap-2 justify-between">
            <div>
              <h2 className="text-base sm:text-xl font-black uppercase tracking-wide text-white leading-tight">{meta.orgName}</h2>
              <p className="text-[#eaa320] text-[10px] font-semibold uppercase tracking-[2px] mt-0.5">Verified Employment Record</p>
            </div>
            <div className="text-right">
              <p className="text-gray-300 text-xs font-semibold uppercase tracking-wide">Certificate of Employment</p>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-[#eaa320] to-[#f5c842]" />

          {/* Body */}
          <div className="flex flex-col md:flex-row">
            {/* Left panel */}
            <div className="md:w-[35%] bg-gray-50 px-4 py-5 sm:px-6 sm:py-6 flex flex-col gap-5 border-b md:border-b-0 md:border-r border-gray-200">
              <div className="flex justify-center">
                {emp.profilePhotoUrl ? (
                  <img src={emp.profilePhotoUrl} alt={emp.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#eaa320]/15 flex items-center justify-center text-[#eaa320] font-black text-3xl border-4 border-white shadow-md">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2.5">
                <Detail label="Name" value={emp.name} bold />
                <Detail label="Father Name" value={emp.fatherName ?? "—"} />
                <Detail label="Date of Birth" value={formatDate(emp.dateOfBirth)} />
                <Detail label="Designation" value={emp.designation ?? "—"} />
                <Detail label="Joining Date" value={formatDate(emp.joiningDate)} />
                <Detail label="Leaving Date" value={emp.isCurrentlyWorking ? "Currently Working" : formatDate(emp.leavingDate)} />
                {emp.address && <Detail label="Address" value={emp.address} />}
              </div>
            </div>

            {/* Right panel */}
            <div className="md:w-[65%] px-4 py-5 sm:px-6 sm:py-6 flex flex-col gap-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[2px]">Certificate Details</p>
              {hasMarkdown ? (
                <div className="text-sm text-gray-700 leading-relaxed space-y-3 [&_h1]:text-lg [&_h1]:font-black [&_h1]:text-gray-900 [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mb-1.5 [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mb-1 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_blockquote]:border-l-4 [&_blockquote]:border-[#eaa320] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_strong]:font-bold [&_hr]:border-gray-200 [&_hr]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_th]:border [&_th]:border-gray-200 [&_th]:px-2 [&_th]:py-1.5 [&_th]:bg-gray-50 [&_th]:font-semibold [&_td]:border [&_td]:border-gray-200 [&_td]:px-2 [&_td]:py-1.5">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.certificateMarkdown!}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-600 text-sm leading-relaxed">{data.certificateText}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-8 py-3 text-center">
            <p className="text-gray-400 text-[10px] uppercase tracking-widest">
              Computer-Generated Document · {meta.orgName} · Issued via Official Verification Portal
            </p>
          </div>
        </div>

        <button onClick={() => setData(null)} className="btn-primary px-6 py-2.5 font-bold cursor-pointer text-sm">
          Verify Another Record
        </button>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-10 max-w-lg mx-auto w-full">
      <Helmet>
        <title>Employment Verification - Skywaves Educare</title>
        <meta name="description" content="Verify the employment records of Skywaves Educare faculty and staff efficiently." />
      </Helmet>
      <div className="mb-6 border-b border-gray-200 pb-5 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{cfg.heading}</h2>
        <p className="text-gray-500 text-sm md:text-base">{cfg.description}</p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-600">Employee Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white focus:border-[#eaa320] focus:outline-none focus:ring-2 focus:ring-[#eaa320]/20 p-4 text-base uppercase placeholder:normal-case"
            placeholder="Enter the employee's full name"
            type="text"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-600">{cfg.refLabel}</label>
          <input
            required
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white focus:border-[#eaa320] focus:outline-none focus:ring-2 focus:ring-[#eaa320]/20 p-4 text-base tracking-wider uppercase placeholder:normal-case placeholder:tracking-normal"
            placeholder={cfg.refPlaceholder}
            type="text"
          />
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base font-bold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 rounded-xl">
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Verifying..." : "Verify Employment"}
        </button>
      </form>
    </section>
  );
}

function Detail({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-dashed border-gray-200 pb-2">
      <span className="text-gray-400 text-xs uppercase tracking-wide shrink-0 mt-0.5">{label}</span>
      <span className={`text-right ${bold ? "font-bold text-gray-900 text-sm" : "font-medium text-gray-700 text-xs"}`}>{value}</span>
    </div>
  );
}
