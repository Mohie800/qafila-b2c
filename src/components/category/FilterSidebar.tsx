"use client";

import { useTranslations } from "next-intl";
import FilterAccordion from "./FilterAccordion";
import FilterCheckboxList from "./FilterCheckboxList";
import FilterPriceRange from "./FilterPriceRange";
import FilterSaleToggle from "./FilterSaleToggle";
import type { FilterOptions } from "@/types/filters";

interface FilterSidebarProps {
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
  className?: string;
}

export default function FilterSidebar({
  filterOptions,
  selectedBrandIds,
  selectedColorIds,
  selectedSizeIds,
  selectedMaterialIds,
  selectedPatternIds,
  selectedSubcategoryIds,
  minPrice,
  maxPrice,
  onSale,
  onToggleBrand,
  onToggleColor,
  onToggleSize,
  onToggleMaterial,
  onTogglePattern,
  onToggleSubcategory,
  onPriceApply,
  onToggleSale,
  onClearAll,
  hasActiveFilters,
  className = "",
}: FilterSidebarProps) {
  const t = useTranslations("categoryPage.filters");

  return (
    <div className={className}>
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-sm font-bold text-dark">{t("title")}</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-primary hover:underline"
          >
            {t("clearAll")}
          </button>
        )}
      </div>

      {/* Brand */}
      {filterOptions.brands.length > 0 && (
        <FilterAccordion title={t("brand")}>
          <FilterCheckboxList
            items={filterOptions.brands}
            selectedIds={selectedBrandIds}
            onToggle={onToggleBrand}
            searchable
            searchPlaceholder={t("searchBrands")}
          />
        </FilterAccordion>
      )}

      {/* Subcategories */}
      {filterOptions.subcategories.length > 0 && (
        <FilterAccordion title={t("category")}>
          <FilterCheckboxList
            items={filterOptions.subcategories}
            selectedIds={selectedSubcategoryIds}
            onToggle={onToggleSubcategory}
          />
        </FilterAccordion>
      )}

      {/* Color */}
      {filterOptions.colors.length > 0 && (
        <FilterAccordion title={t("color")}>
          <FilterCheckboxList
            items={filterOptions.colors}
            selectedIds={selectedColorIds}
            onToggle={onToggleColor}
            showColorSwatch
          />
        </FilterAccordion>
      )}

      {/* Size */}
      {filterOptions.sizes.length > 0 && (
        <FilterAccordion title={t("size")}>
          <FilterCheckboxList
            items={filterOptions.sizes}
            selectedIds={selectedSizeIds}
            onToggle={onToggleSize}
          />
        </FilterAccordion>
      )}

      {/* Price */}
      <FilterAccordion title={t("price")}>
        <FilterPriceRange
          minPrice={minPrice}
          maxPrice={maxPrice}
          onApply={onPriceApply}
        />
      </FilterAccordion>

      {/* Material */}
      {filterOptions.materials.length > 0 && (
        <FilterAccordion title={t("material")}>
          <FilterCheckboxList
            items={filterOptions.materials}
            selectedIds={selectedMaterialIds}
            onToggle={onToggleMaterial}
          />
        </FilterAccordion>
      )}

      {/* Pattern */}
      {filterOptions.patterns.length > 0 && (
        <FilterAccordion title={t("pattern")}>
          <FilterCheckboxList
            items={filterOptions.patterns}
            selectedIds={selectedPatternIds}
            onToggle={onTogglePattern}
          />
        </FilterAccordion>
      )}

      {/* Sale */}
      <FilterAccordion title={t("sale")} defaultOpen={false}>
        <FilterSaleToggle
          label={t("sale")}
          isActive={onSale}
          onToggle={onToggleSale}
        />
      </FilterAccordion>
    </div>
  );
}
