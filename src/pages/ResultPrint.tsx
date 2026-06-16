import { useParams, useSearchParams } from "react-router-dom";
import { Printer, Download, Share2, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useApi } from "../hooks/useApi";
import { publicApi } from "../lib/api/public";
import ResultSheet from "../components/ResultSheet";

export default function ResultPrint() {
  const { rollNumber } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const { data, loading, error } = useApi(() => publicApi.getResultByToken(token), [token]);

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const shareData = {
      title: "Skywaves Educare Result",
      text: data ? `Result for ${data.student.name} (${data.student.rollNumber})` : "Result",
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Result link copied to clipboard");
      } catch {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareData.url)}`, "_blank");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#eaa320]" size={40} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Result Unavailable</h1>
        <p className="text-gray-600">{error ?? "This result link has expired. Please verify again."}</p>
        <a href="/verification" className="btn-primary px-6 py-3 cursor-pointer">Back to Verification</a>
      </div>
    );
  }

  const btnBase = "px-5 py-2.5 rounded-lg font-semibold text-sm cursor-pointer flex items-center gap-2 transition-colors";

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <Helmet>
        <title>Result - {data.student.name}</title>
      </Helmet>

      <div className="no-print max-w-[210mm] mx-auto px-4 mb-6 flex flex-wrap gap-3 justify-end">
        <button onClick={handlePrint} className={`${btnBase} bg-[#eaa320] hover:bg-[#de9b1f] text-gray-900`}>
          <Printer size={18} /> Print
        </button>
        <button onClick={handlePrint} className={`${btnBase} bg-white border border-gray-300 text-gray-700 hover:bg-gray-50`}>
          <Download size={18} /> Download PDF
        </button>
        <button onClick={handleShare} className={`${btnBase} bg-white border border-gray-300 text-gray-700 hover:bg-gray-50`}>
          <Share2 size={18} /> Share
        </button>
      </div>

      <div className="print-sheet bg-white mx-auto shadow-lg print:shadow-none flex flex-col" style={{ width: "210mm", minHeight: "297mm", padding: "16mm" }}>
        <ResultSheet result={data} />
        <p className="text-center text-xs text-gray-400 mt-auto pt-8">
          This is a computer-generated statement of marks from Skywaves Educare.
        </p>
      </div>
    </div>
  );
}
