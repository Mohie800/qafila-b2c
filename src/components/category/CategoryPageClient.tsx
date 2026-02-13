"use client";

import { useState } from "react";
import { useFilters } from "@/lib/hooks/useFilters";
import CategoryHeader from "./CategoryHeader";
import ActiveFilters from "./ActiveFilters";
import FilterSidebar from "./FilterSidebar";
import MobileFilterDrawer from "./MobileFilterDrawer";
import ProductGrid from "./ProductGrid";
import Pagination from "./Pagination";
import type { Product } from "@/components/shared/ProductCard";
import type { FilterOptions } from "@/types/filters";
import type { PaginationMeta } from "@/lib/api/types";

interface CategoryPageClientProps {
  categoryName: string;
  products: Product[];
  pagination: PaginationMeta;
  filterOptions: FilterOptions;
}

export default function CategoryPageClient({
  categoryName,
  products,
  pagination,
  filterOptions,
}: CategoryPageClientProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const {
    getParam,
    getParamIds,
    updateFilter,
    toggleFilterId,
    clearAllFilters,
    hasActiveFilters,
    isPending,
  } = useFilters();

  const selectedBrandIds = getParamIds("brandId");
  const selectedColorIds = getParamIds("colorId");
  const selectedSizeIds = getParamIds("sizeId");
  const selectedMaterialIds = getParamIds("materialId");
  const selectedPatternIds = getParamIds("patternId");
  const selectedSubcategoryIds = getParamIds("categoryId");
  const minPrice = getParam("minPrice");
  const maxPrice = getParam("maxPrice");
  const onSale = getParam("onSale") === "true";
  const sortBy = getParam("sortBy");
  const sortOrder = getParam("sortOrder");

  const handleSort = (newSortBy: string, newSortOrder: string) => {
    updateFilter("sortBy", newSortBy || null);
    // sortOrder is set separately since updateFilter resets page
    if (newSortOrder) {
      updateFilter("sortOrder", newSortOrder);
    } else {
      updateFilter("sortOrder", null);
    }
  };

  const handlePriceApply = (min: string, max: string) => {
    updateFilter("minPrice", min || null);
    updateFilter("maxPrice", max || null);
  };

  const handleToggleSale = () => {
    updateFilter("onSale", onSale ? null : "true");
  };

  const handlePageChange = (page: number) => {
    updateFilter("page", page > 1 ? String(page) : null);
  };

  const sidebarProps = {
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
    onToggleBrand: (id: string) => toggleFilterId("brandId", id),
    onToggleColor: (id: string) => toggleFilterId("colorId", id),
    onToggleSize: (id: string) => toggleFilterId("sizeId", id),
    onToggleMaterial: (id: string) => toggleFilterId("materialId", id),
    onTogglePattern: (id: string) => toggleFilterId("patternId", id),
    onToggleSubcategory: (id: string) => toggleFilterId("categoryId", id),
    onPriceApply: handlePriceApply,
    onToggleSale: handleToggleSale,
    onClearAll: clearAllFilters,
    hasActiveFilters,
  };

  return (
    <>
      <CategoryHeader
        title={categoryName}
        totalResults={pagination.total}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onOpenFilters={() => setMobileFiltersOpen(true)}
      />

      <ActiveFilters
        filterOptions={filterOptions}
        selectedBrandIds={selectedBrandIds}
        selectedColorIds={selectedColorIds}
        selectedSizeIds={selectedSizeIds}
        selectedMaterialIds={selectedMaterialIds}
        selectedPatternIds={selectedPatternIds}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onSale={onSale}
        onRemoveBrand={(id) => toggleFilterId("brandId", id)}
        onRemoveColor={(id) => toggleFilterId("colorId", id)}
        onRemoveSize={(id) => toggleFilterId("sizeId", id)}
        onRemoveMaterial={(id) => toggleFilterId("materialId", id)}
        onRemovePattern={(id) => toggleFilterId("patternId", id)}
        onRemovePrice={() => handlePriceApply("", "")}
        onRemoveSale={handleToggleSale}
        onClearAll={clearAllFilters}
      />

      <div className="flex gap-8">
        <FilterSidebar
          {...sidebarProps}
          className="hidden w-[240px] shrink-0 lg:block"
        />

        <div className="min-w-0 flex-1">
          <ProductGrid products={products} isPending={isPending} />
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        {...sidebarProps}
      />
    </>
  );
}
