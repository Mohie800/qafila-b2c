"use client";

import { useTranslations, useLocale } from "next-intl";
import { X } from "lucide-react";
import type { FilterOptions } from "@/types/filters";

interface ActiveFiltersProps {
  filterOptions: FilterOptions;
  selectedBrandIds: string[];
  selectedColorIds: string[];
  selectedSizeIds: string[];
  selectedMaterialIds: string[];
  selectedPatternIds: string[];
  minPrice: string;
  maxPrice: string;
  onSale: boolean;
  onRemoveBrand: (id: string) => void;
  onRemoveColor: (id: string) => void;
  onRemoveSize: (id: string) => void;
  onRemoveMaterial: (id: string) => void;
  onRemovePattern: (id: string) => void;
  onRemovePrice: () => void;
  onRemoveSale: () => void;
  onClearAll: () => void;
}

function getLabel(
  items: { id: string; name: string; nameAr: string }[],
  id: string,
  locale: string,
) {
  const item = items.find((i) => i.id === id);
  if (!item) return id;
  return locale === "ar" ? item.nameAr || item.name : item.name;
}

export default function ActiveFilters({
  filterOptions,
  selectedBrandIds,
  selectedColorIds,
  selectedSizeIds,
  selectedMaterialIds,
  selectedPatternIds,
  minPrice,
  maxPrice,
  onSale,
  onRemoveBrand,
  onRemoveColor,
  onRemoveSize,
  onRemoveMaterial,
  onRemovePattern,
  onRemovePrice,
  onRemoveSale,
  onClearAll,
}: ActiveFiltersProps) {
  const t = useTranslations("categoryPage.filters");
  const locale = useLocale();

  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  for (const id of selectedBrandIds) {
    chips.push({
      key: `brand-${id}`,
      label: getLabel(filterOptions.brands, id, locale),
      onRemove: () => onRemoveBrand(id),
    });
  }

  for (const id of selectedColorIds) {
    chips.push({
      key: `color-${id}`,
      label: getLabel(filterOptions.colors, id, locale),
      onRemove: () => onRemoveColor(id),
    });
  }

  for (const id of selectedSizeIds) {
    chips.push({
      key: `size-${id}`,
      label: getLabel(filterOptions.sizes, id, locale),
      onRemove: () => onRemoveSize(id),
    });
  }

  for (const id of selectedMaterialIds) {
    chips.push({
      key: `material-${id}`,
      label: getLabel(filterOptions.materials, id, locale),
      onRemove: () => onRemoveMaterial(id),
    });
  }

  for (const id of selectedPatternIds) {
    chips.push({
      key: `pattern-${id}`,
      label: getLabel(filterOptions.patterns, id, locale),
      onRemove: () => onRemovePattern(id),
    });
  }

  if (minPrice || maxPrice) {
    const priceLabel = `${minPrice || "0"} - ${maxPrice || "∞"} ﷼`;
    chips.push({
      key: "price",
      label: priceLabel,
      onRemove: onRemovePrice,
    });
  }

  if (onSale) {
    chips.push({
      key: "sale",
      label: t("sale"),
      onRemove: onRemoveSale,
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full bg-gray-light px-3 py-1 text-xs text-dark"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="text-gray-text hover:text-dark"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-primary hover:underline"
      >
        {t("clearAll")}
      </button>
    </div>
  );
}
