"use client";

import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface QuantityPickerProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
}

export default function QuantityPicker({
  value,
  min = 1,
  max,
  onChange,
}: QuantityPickerProps) {
  const t = useTranslations("productDetail");

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-dark dark:text-gray-200">{t("quantity")}</p>
      <div className="inline-flex items-center rounded-lg border border-gray-border dark:border-gray-700">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-10 w-10 items-center justify-center text-gray-text transition-colors hover:text-dark dark:hover:text-gray-100 disabled:opacity-30"
          aria-label="Decrease quantity"
        >
          <Minus size={16} />
        </button>
        <span className="flex h-10 w-10 items-center justify-center text-sm font-semibold text-dark dark:text-gray-100">
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-10 w-10 items-center justify-center text-gray-text transition-colors hover:text-dark dark:hover:text-gray-100 disabled:opacity-30"
          aria-label="Increase quantity"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
