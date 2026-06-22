import { useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Printer, Download, Loader2, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { useApi } from "../hooks/useApi";
import { publicApi } from "../lib/api/public";
import ResultSheet from "../components/ResultSheet";
import GradeCard from "../components/GradeCard";

export default function ResultPrint() {
  const { rollNumber: _rollNumber } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const sheetRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const { data, loading, error } = useApi(() => publicApi.getResultByToken(token), [token]);

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    const node = sheetRef.current;
    if (!node || !data) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        windowWidth: 1000,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const ratio = Math.min((pageW - margin * 2) / canvas.width, (pageH - margin * 2) / canvas.height);
      const imgW = canvas.width * ratio;
      const imgH = canvas.height * ratio;
      pdf.addImage(imgData, "PNG", (pageW - imgW) / 2, margin, imgW, imgH);
      pdf.save(`Result-${data.student.rollNumber}.pdf`);
    } finally {
      setDownloading(false);
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

  const btnBase = "px-5 py-2.5 rounded-lg font-semibold text-sm cursor-pointer flex items-center gap-2 transition-colors disabled:opacity-60";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          html, body { background: #ffffff !important; }
          body * { visibility: hidden; }
          #result-sheet, #result-sheet * { visibility: visible; }
          #result-sheet { position: absolute; left: 0; top: 0; width: 100% !important; max-width: none !important; box-shadow: none !important; zoom: 0.7; }
          .no-print { display: none !important; }
        }
      ` }} />

      <div className="min-h-screen bg-gray-100 py-6 sm:py-8 print:bg-white print:py-0">
        <Helmet>
          <title>Result - {data.student.name}</title>
        </Helmet>

        <div className="no-print max-w-[1000px] mx-auto px-4 mb-6 flex flex-wrap gap-3 justify-between items-center">
          <button
            onClick={() => { if (window.history.length > 1) window.history.back(); else window.location.href = "/verification"; }}
            className={`${btnBase} bg-white border border-gray-300 text-gray-700 hover:bg-gray-50`}
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex flex-wrap gap-3">
            <button onClick={handlePrint} className={`${btnBase} bg-[#eaa320] hover:bg-[#de9b1f] text-gray-900`}>
              <Printer size={18} /> Print
            </button>
            <button onClick={handleDownloadPDF} disabled={downloading} className={`${btnBase} bg-white border border-gray-300 text-gray-700 hover:bg-gray-50`}>
              {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} Download PDF
            </button>
          </div>
        </div>

        <div id="result-sheet" ref={sheetRef} className="mx-auto w-full max-w-[1000px] px-4 sm:px-0">
          {data.resultType === "gradecard" ? (
            <GradeCard result={data} />
          ) : (
            <ResultSheet result={data} />
          )}
        </div>
      </div>
    </>
  );
}
