import { useState, type FormEvent } from "react";
import { CheckCircle, Award, Loader2, ExternalLink } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useContent } from "../context/ContentContext";
import { useMutation } from "../hooks/useApi";
import { publicApi } from "../lib/api/public";
import type { StudentResult } from "../lib/api/types";
import GradeCard from "./GradeCard";
import ResultSheet from "./ResultSheet";

export default function StudentVerification() {
  const { verification } = useContent();
  const cfg = verification.student;
  const { mutate, loading, error } = useMutation(publicApi.verifyStudent);
  const [result, setResult] = useState<StudentResult | null>(null);
  const [rollNumber, setRollNumber] = useState("");
  const [dob, setDob] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await mutate(rollNumber.trim(), dob);
      setResult(res);
    } catch {
      // error surfaced via hook
    }
  };

  if (result) {
    const printUrl = `/verification/result/${encodeURIComponent(result.student.rollNumber)}?token=${result.resultToken}`;
    return (
      <section className="bento-card p-6 md:p-10 bg-surface-container-lowest max-w-5xl mx-auto w-full flex flex-col items-center gap-8">
        <Helmet>
          <title>Student Verified - Skywaves Educare</title>
        </Helmet>
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle size={40} />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Verification Successful</h2>
          <p className="text-gray-600 text-lg">Record found. The result details are displayed below.</p>
        </div>

        <button onClick={() => setResult(null)} className="btn-primary px-8 py-3 font-bold cursor-pointer">
          ← Verify Another Student
        </button>

        {result.resultType === "gradecard" ? <GradeCard result={result} /> : <ResultSheet result={result} />}

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <a href={printUrl} target="_blank" rel="noreferrer" className="btn-primary px-8 py-3 font-bold cursor-pointer flex items-center gap-2">
            <ExternalLink size={18} /> View / Print Result
          </a>
          <button onClick={() => setResult(null)} className="btn-secondary text-gray-700 border-gray-300 px-8 py-3 font-bold cursor-pointer">
            Verify Another Student
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bento-card p-6 md:p-12 bg-surface-container-lowest max-w-3xl mx-auto w-full">
      <Helmet>
        <title>Student Verification - Skywaves Educare</title>
        <meta name="description" content="Verify student certifications and qualifications instantly at Skywaves Educare." />
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
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            className="w-full rounded-[10px] border border-outline-variant bg-surface-container-lowest focus:ring-[#eaa320] focus:border-[#eaa320] p-4 outline-none text-lg tracking-wider"
            placeholder={cfg.refPlaceholder}
            type="text"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="mt-4">
          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-xl font-bold cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 size={20} className="animate-spin" />}
            {loading ? "Verifying..." : "Verify Student"}
          </button>
        </div>
      </form>

      <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
        <Award size={18} />
        <span className="text-sm">Official Skywaves Educare verification</span>
      </div>
    </section>
  );
}
