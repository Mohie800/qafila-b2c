"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { generatePdf } from "@/lib/api/ai-research";

interface PdfDownloadButtonProps {
  title: string;
  content: string;
  pdfId?: string;
  downloadUrl?: string;
}

export default function PdfDownloadButton({
  title,
  content,
  pdfId: initialPdfId,
  downloadUrl: initialDownloadUrl,
}: PdfDownloadButtonProps) {
  const t = useTranslations("research");
  const locale = useLocale();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfId, setPdfId] = useState(initialPdfId);
  const [downloadUrl, setDownloadUrl] = useState(initialDownloadUrl);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (downloadUrl) {
      // Already generated — just download
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("qafila_token");
      const fullUrl = `${apiUrl}${downloadUrl}`;

      const link = document.createElement("a");
      link.href = fullUrl;
      link.setAttribute("download", `qafila-research-${pdfId}.pdf`);
      // Add auth header via fetch + blob
      try {
        const res = await fetch(fullUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const blob = await res.blob();
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        window.open(fullUrl, "_blank");
      }
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const result = await generatePdf(title, content, locale as "en" | "ar");
      setPdfId(result.pdfId);
      setDownloadUrl(result.downloadUrl);

      // Trigger download
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("qafila_token");
      const fullUrl = `${apiUrl}${result.downloadUrl}`;
      const res = await fetch(fullUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `qafila-research-${result.pdfId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-1">
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {isGenerating ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Download size={15} />
        )}
        {isGenerating ? t("generating") : t("downloadPdf")}
      </button>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
