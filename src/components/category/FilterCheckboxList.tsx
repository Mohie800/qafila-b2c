"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

interface FilterItem {
  id: string;
  name: string;
  nameAr: string;
  hexCode?: string | null;
}

interface FilterCheckboxListProps {
  items: FilterItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  showColorSwatch?: boolean;
}

export default function FilterCheckboxList({
  items,
  selectedIds,
  onToggle,
  searchable = false,
  searchPlaceholder = "",
  showColorSwatch = false,
}: FilterCheckboxListProps) {
  const locale = useLocale();
  const [search, setSearch] = useState("");

  const filtered = searchable
    ? items.filter((item) => {
        const label = locale === "ar" ? item.nameAr || item.name : item.name;
        return label.toLowerCase().includes(search.toLowerCase());
      })
    : items;

  return (
    <div className="space-y-2">
      {searchable && (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="mb-2 w-full rounded-lg border border-gray-border px-3 py-1.5 text-xs text-dark outline-none focus:border-primary"
        />
      )}
      <div className="max-h-[200px] space-y-1.5 overflow-y-auto">
        {filtered.map((item) => {
          const label =
            locale === "ar" ? item.nameAr || item.name : item.name;
          const isChecked = selectedIds.includes(item.id);

          return (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-xs hover:bg-gray-light"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle(item.id)}
                className="h-3.5 w-3.5 rounded border-gray-border accent-primary"
              />
              {showColorSwatch && item.hexCode && (
                <span
                  className="inline-block h-3.5 w-3.5 rounded-full border border-gray-border"
                  style={{ backgroundColor: item.hexCode }}
                />
              )}
              <span className={isChecked ? "font-medium text-dark" : "text-gray-text"}>
                {label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
