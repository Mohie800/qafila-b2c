"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { generatePdf } from "@/lib/api/ai-research";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

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
  const [downloadUrl, setDownloadUrl] = useState(initialDownloadUrl);
  const [pdfId, setPdfId] = useState(initialPdfId);
  const [error, setError] = useState<string | null>(null);

  const openPdf = (relativeUrl: string, id: string) => {
    const fullUrl = `${API_URL}${relativeUrl}`;
    // Create hidden anchor to trigger browser download
    const a = document.createElement("a");
    a.href = fullUrl;
    a.download = `qafila-research-${id}.pdf`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleClick = async () => {
    if (downloadUrl && pdfId) {
      openPdf(downloadUrl, pdfId);
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const result = await generatePdf(title, content, locale as "en" | "ar");
      setPdfId(result.pdfId);
      setDownloadUrl(result.downloadUrl);
      openPdf(result.downloadUrl, result.pdfId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-1">
      <button
        onClick={handleClick}
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
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
