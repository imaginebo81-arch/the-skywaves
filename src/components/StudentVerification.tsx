import { useState, type FormEvent } from "react";
import { CheckCircle, Award, Loader2, ExternalLink, Calendar } from "lucide-react";
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
  const [dob, setDob] = useState(""); // stored as DD/MM/YYYY

  function handleDobInput(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 8);
    let out = digits.slice(0, 2);
    if (digits.length > 2) out += "/" + digits.slice(2, 4);
    if (digits.length > 4) out += "/" + digits.slice(4, 8);
    setDob(out);
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const [dd, mm, yyyy] = dob.split("/");
      const isoDate = `${yyyy}-${(mm ?? "").padStart(2, "0")}-${(dd ?? "").padStart(2, "0")}`;
      const res = await mutate(rollNumber.trim(), isoDate);
      setResult(res);
    } catch {
      // error surfaced via hook
    }
  };

  if (result) {
    const printUrl = `/verification/result/${encodeURIComponent(result.student.rollNumber)}?token=${result.resultToken}`;
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 max-w-5xl mx-auto w-full flex flex-col items-center gap-6">
        <Helmet>
          <title>Student Verified - Skywaves Educare</title>
        </Helmet>
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle size={32} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Verification Successful</h2>
          <p className="text-gray-500 text-sm md:text-base">Record found. The result details are displayed below.</p>
        </div>

        <button onClick={() => setResult(null)} className="btn-primary px-6 py-2.5 font-bold cursor-pointer text-sm">
          ← Verify Another Student
        </button>

        {result.resultType === "gradecard" ? <GradeCard result={result} /> : <ResultSheet result={result} />}

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <a href={printUrl} target="_blank" rel="noreferrer" className="btn-primary px-6 py-3 font-bold cursor-pointer flex items-center justify-center gap-2 text-sm">
            <ExternalLink size={16} /> View / Print Result
          </a>
          <button onClick={() => setResult(null)} className="border border-gray-300 text-gray-700 rounded-lg px-6 py-3 font-bold cursor-pointer text-sm hover:bg-gray-50 transition-colors">
            Verify Another Student
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-10 max-w-lg mx-auto w-full">
      <Helmet>
        <title>Student Verification - Skywaves Educare</title>
        <meta name="description" content="Verify student certifications and qualifications instantly at Skywaves Educare." />
      </Helmet>
      <div className="mb-6 border-b border-gray-200 pb-5 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{cfg.heading}</h2>
        <p className="text-gray-500 text-sm md:text-base">{cfg.description}</p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-600">Date of Birth</label>
          <div className="relative flex items-center">
            <input
              required
              value={dob}
              onChange={(e) => handleDobInput(e.target.value)}
              placeholder="DD/MM/YYYY"
              pattern="\d{2}/\d{2}/\d{4}"
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-300 bg-white focus:border-[#eaa320] focus:outline-none focus:ring-2 focus:ring-[#eaa320]/20 p-4 pr-12 text-base"
              type="text"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 group">
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center z-10 text-gray-400 group-hover:text-[#eaa320] transition-colors">
                <Calendar size={20} />
              </span>
              <input
                type="date"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                tabIndex={-1}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split("-");
                    setDob(`${d}/${m}/${y}`);
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-600">{cfg.refLabel}</label>
          <input
            required
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white focus:border-[#eaa320] focus:outline-none focus:ring-2 focus:ring-[#eaa320]/20 p-4 text-base tracking-wider"
            placeholder={cfg.refPlaceholder}
            type="text"
          />
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base font-bold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 mt-1 rounded-xl">
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Verifying..." : "Verify Student"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
        <Award size={16} />
        <span className="text-xs">Official Skywaves Educare verification</span>
      </div>
    </section>
  );
}
