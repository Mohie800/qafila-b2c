"use client";

import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";
import SortDropdown from "./SortDropdown";

interface CategoryHeaderProps {
  title: string;
  totalResults: number;
  sortBy: string;
  sortOrder: string;
  onSort: (sortBy: string, sortOrder: string) => void;
  onOpenFilters: () => void;
}

export default function CategoryHeader({
  title,
  totalResults,
  sortBy,
  sortOrder,
  onSort,
  onOpenFilters,
}: CategoryHeaderProps) {
  const t = useTranslations("categoryPage");

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-dark dark:text-gray-100">{title}</h1>
        <p className="mt-0.5 text-xs text-gray-text dark:text-gray-400">
          {t("showedResults", { count: totalResults })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <SortDropdown sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
        <button
          type="button"
          onClick={onOpenFilters}
          className="flex items-center gap-1.5 rounded-lg border border-gray-border dark:border-gray-700 px-3 py-1.5 text-xs text-dark dark:text-gray-200 lg:hidden"
        >
          <SlidersHorizontal size={14} />
          {t("filters.showFilters")}
        </button>
      </div>
    </div>
  );
}
