"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { getMediaUrl } from "@/lib/utils";

export interface ColorVariant {
  id: string;
  name: string;
  hexCode: string | null;
  image: string | null;
  slug: string;
}

interface ColorSelectorProps {
  colors: ColorVariant[];
  selectedId: string | null;
  onSelect: (color: ColorVariant) => void;
}

export default function ColorSelector({
  colors,
  selectedId,
  onSelect,
}: ColorSelectorProps) {
  const t = useTranslations("productDetail");

  if (colors.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <p className="text-sm font-semibold text-dark dark:text-gray-200">{t("color")}</p>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const isSelected = color.id === selectedId;
          return (
            <button
              key={color.id}
              onClick={() => onSelect(color)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-1.5 transition-colors ${
                isSelected
                  ? "border-primary"
                  : "border-gray-border dark:border-gray-700 hover:border-gray-text dark:hover:border-gray-500"
              }`}
            >
              {color.image ? (
                <div className="relative h-12 w-12 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={getMediaUrl(color.image) || color.image}
                    alt={color.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div
                  className="h-12 w-12 rounded-md border border-gray-200"
                  style={{
                    backgroundColor: color.hexCode || "#ccc",
                  }}
                />
              )}
              <span className="text-[10px] font-medium text-gray-text">
                {color.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
