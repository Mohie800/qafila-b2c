"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  const t = useTranslations("categoryPage.pagination");

  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, total);

  // Build page numbers to show
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="text-xs text-gray-text">
        {t("showingResults", { from, to, total })}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center gap-1 rounded-lg border border-gray-border px-3 py-1.5 text-xs text-dark disabled:opacity-40"
        >
          <ChevronLeft size={14} className="rtl:rotate-180" />
          {t("previous")}
        </button>

        {pages.map((page, idx) =>
          page === "..." ? (
            <span key={`dots-${idx}`} className="px-1 text-xs text-gray-text">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                page === currentPage
                  ? "bg-dark text-white"
                  : "border border-gray-border text-dark hover:bg-gray-light"
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center gap-1 rounded-lg border border-gray-border px-3 py-1.5 text-xs text-dark disabled:opacity-40"
        >
          {t("next")}
          <ChevronRight size={14} className="rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
