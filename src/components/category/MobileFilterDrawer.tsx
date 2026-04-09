"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { useEffect } from "react";
import FilterSidebar from "./FilterSidebar";
import type { FilterOptions } from "@/types/filters";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filterOptions: FilterOptions;
  selectedBrandIds: string[];
  selectedColorIds: string[];
  selectedSizeIds: string[];
  selectedMaterialIds: string[];
  selectedPatternIds: string[];
  selectedSubcategoryIds: string[];
  minPrice: string;
  maxPrice: string;
  onSale: boolean;
  onToggleBrand: (id: string) => void;
  onToggleColor: (id: string) => void;
  onToggleSize: (id: string) => void;
  onToggleMaterial: (id: string) => void;
  onTogglePattern: (id: string) => void;
  onToggleSubcategory: (id: string) => void;
  onPriceApply: (min: string, max: string) => void;
  onToggleSale: () => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  ...sidebarProps
}: MobileFilterDrawerProps) {
  const t = useTranslations("categoryPage.filters");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 start-0 z-50 w-[300px] overflow-y-auto bg-white dark:bg-dark p-5 shadow-xl transition-transform duration-300 lg:hidden ${
          isOpen
            ? "translate-x-0 rtl:-translate-x-0"
            : "-translate-x-full rtl:translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-dark dark:text-gray-100">{t("title")}</h2>
          <button type="button" onClick={onClose}>
            <X size={20} className="text-gray-text" />
          </button>
        </div>

        <FilterSidebar {...sidebarProps} />

        <div className="sticky bottom-0 mt-4 border-t border-gray-border dark:border-gray-700 bg-white dark:bg-dark pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            {t("apply")}
          </button>
        </div>
      </div>
    </>
  );
}
