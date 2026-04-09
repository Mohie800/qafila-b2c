"use client";

import { useTranslations } from "next-intl";

export interface SizeOption {
  id: string;
  name: string;
  stock: number;
}

interface SizeSelectorProps {
  sizes: SizeOption[];
  selectedId: string | null;
  onSelect: (size: SizeOption) => void;
}

export default function SizeSelector({
  sizes,
  selectedId,
  onSelect,
}: SizeSelectorProps) {
  const t = useTranslations("productDetail");

  if (sizes.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <p className="text-sm font-semibold text-dark dark:text-gray-200">{t("size")}</p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isSelected = size.id === selectedId;
          const isOutOfStock = size.stock === 0;
          return (
            <button
              key={size.id}
              onClick={() => !isOutOfStock && onSelect(size)}
              disabled={isOutOfStock}
              className={`flex min-w-[56px] flex-col items-center rounded-lg border-2 px-3 py-2 text-sm transition-colors ${
                isOutOfStock
                  ? "cursor-not-allowed border-gray-border dark:border-gray-700 bg-gray-50 dark:bg-dark text-gray-300 line-through"
                  : isSelected
                    ? "border-primary bg-primary/5 font-semibold text-primary"
                    : "border-gray-border dark:border-gray-700 text-dark dark:text-gray-200 hover:border-gray-text dark:hover:border-gray-500"
              }`}
            >
              <span>{size.name}</span>
              {!isOutOfStock && size.stock <= 5 && (
                <span className="mt-0.5 text-[10px] text-discount">
                  {size.stock}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
