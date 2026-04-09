"use client";

import { useTranslations } from "next-intl";

interface SortDropdownProps {
  sortBy: string;
  sortOrder: string;
  onSort: (sortBy: string, sortOrder: string) => void;
}

const SORT_OPTIONS = [
  { key: "relevance", sortBy: "", sortOrder: "" },
  { key: "priceLowHigh", sortBy: "price", sortOrder: "asc" },
  { key: "priceHighLow", sortBy: "price", sortOrder: "desc" },
  { key: "newest", sortBy: "createdAt", sortOrder: "desc" },
  { key: "nameAZ", sortBy: "title", sortOrder: "asc" },
  { key: "nameZA", sortBy: "title", sortOrder: "desc" },
];

export default function SortDropdown({
  sortBy,
  sortOrder,
  onSort,
}: SortDropdownProps) {
  const t = useTranslations("categoryPage");

  const currentValue = sortBy ? `${sortBy}-${sortOrder}` : "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      onSort("", "");
      return;
    }
    const [newSortBy, newSortOrder] = value.split("-");
    onSort(newSortBy, newSortOrder);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-text">{t("sortBy")}:</span>
      <select
        value={currentValue}
        onChange={handleChange}
        className="rounded-lg border border-gray-border dark:border-gray-700 bg-white dark:bg-dark px-3 py-1.5 text-xs text-dark dark:text-gray-200 outline-none focus:border-primary"
      >
        {SORT_OPTIONS.map((option) => (
          <option
            key={option.key}
            value={option.sortBy ? `${option.sortBy}-${option.sortOrder}` : ""}
          >
            {t(`sortOptions.${option.key}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
