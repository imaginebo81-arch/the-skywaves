import { CheckCircle, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
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
    const hasMarkdown = !!data.certificateMarkdown?.trim();
    return (
      <section className="bento-card p-6 md:p-12 bg-surface-container-lowest max-w-4xl mx-auto w-full flex flex-col items-center gap-8">
        <Helmet>
          <title>Employment Verified - Skywaves Educare</title>
        </Helmet>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Verification Successful</h2>
            <p className="text-gray-600 text-lg">Record found. The employment details are displayed below.</p>
          </div>
        </div>

        <button onClick={() => setData(null)} className="btn-primary px-8 py-3 font-bold cursor-pointer">
          ← Verify Another Record
        </button>

        <div className="w-full max-w-4xl rounded-2xl overflow-hidden bg-white shadow-lg text-left border border-gray-100">
          <div className="bg-[#151b23] text-white px-10 py-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-white leading-tight">{meta.orgName}</h2>
              <p className="text-[#eaa320] text-[11px] font-semibold uppercase tracking-[3px] mt-1">Verified Employment Record</p>
            </div>
            <div className="text-right">
              <p className="text-gray-300 text-sm uppercase tracking-widest font-semibold">Certificate of Employment</p>
            </div>
          </div>
          <div className="h-1.5 bg-gradient-to-r from-[#eaa320] to-[#f5c842]" />
          <div className="flex flex-col md:flex-row min-h-[360px]">
            <div className="md:w-[30%] bg-gray-50 px-8 py-8 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-gray-200">
              <div className="flex justify-center">
                {emp.profilePhotoUrl ? (
                  <img src={emp.profilePhotoUrl} alt={emp.name} className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-[#eaa320]/15 flex items-center justify-center text-[#eaa320] font-black text-4xl border-4 border-white shadow-md">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Detail label="Name" value={emp.name} bold />
                <Detail label="Father Name" value={emp.fatherName ?? "—"} />
                <Detail label="Date of Birth" value={formatDate(emp.dateOfBirth)} />
                <Detail label="Designation" value={emp.designation ?? "—"} />
                <Detail label="Joining Date" value={formatDate(emp.joiningDate)} />
                <Detail label="Leaving Date" value={emp.isCurrentlyWorking ? "Currently Working" : formatDate(emp.leavingDate)} />
                {emp.address && <Detail label="Address" value={emp.address} />}
              </div>
            </div>
            <div className="md:w-[70%] px-8 py-8 flex flex-col gap-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[2px]">Certificate Details</p>
              {hasMarkdown ? (
                <div className="text-[14px] text-gray-700 leading-[1.8] space-y-3 [&_h1]:text-xl [&_h1]:font-black [&_h1]:text-gray-900 [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mb-2 [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1 [&_blockquote]:border-l-4 [&_blockquote]:border-[#eaa320] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_strong]:font-bold [&_em]:italic [&_hr]:border-gray-200 [&_hr]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_th]:border [&_th]:border-gray-200 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-50 [&_th]:font-semibold [&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.certificateMarkdown!}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-600 text-sm leading-relaxed">{data.certificateText}</p>
              )}
            </div>
          </div>
          <div className="bg-gray-50 border-t border-gray-200 px-10 py-3.5 text-center">
            <p className="text-gray-400 text-[10px] uppercase tracking-widest">
              Computer-Generated Document · {meta.orgName} · Issued via Official Verification Portal
            </p>
          </div>
        </div>

        <button onClick={() => setData(null)} className="btn-primary px-8 py-3 font-bold cursor-pointer">
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

function Detail({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-dashed border-gray-200 pb-2">
      <span className="text-gray-400 text-xs uppercase tracking-wide shrink-0 mt-0.5">{label}</span>
      <span className={`text-right ${bold ? "font-bold text-gray-900 text-sm" : "font-medium text-gray-700 text-xs"}`}>{value}</span>
    </div>
  );
}
