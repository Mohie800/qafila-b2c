"use client";

import { ExternalLink } from "lucide-react";

interface SourceCitationProps {
  url: string;
  title: string;
  snippet?: string;
}

export default function SourceCitation({ url, title }: SourceCitationProps) {
  const domain = (() => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  })();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 transition-colors hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-dark/60 dark:text-gray-400 dark:hover:border-primary dark:hover:text-primary"
    >
      <ExternalLink size={11} />
      <span className="max-w-[150px] truncate">{title || domain}</span>
    </a>
  );
}
