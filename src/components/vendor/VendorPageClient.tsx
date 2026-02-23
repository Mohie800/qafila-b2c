"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useFilters } from "@/lib/hooks/useFilters";
import { SlidersHorizontal } from "lucide-react";
import VendorHeader from "./VendorHeader";
import VendorTabs, { type VendorTab } from "./VendorTabs";
import VendorReviews from "./VendorReviews";
import ActiveFilters from "@/components/category/ActiveFilters";
import FilterSidebar from "@/components/category/FilterSidebar";
import MobileFilterDrawer from "@/components/category/MobileFilterDrawer";
import ProductGrid from "@/components/category/ProductGrid";
import Pagination from "@/components/category/Pagination";
import SortDropdown from "@/components/category/SortDropdown";
import LoginModal from "@/components/auth/LoginModal";
import type { VendorProfile } from "@/lib/api/vendors";
import type { Product } from "@/components/shared/ProductCard";
import type { FilterOptions } from "@/types/filters";
import type { PaginationMeta } from "@/lib/api/types";
import type { ApiReview } from "@/lib/api/reviews";

interface VendorPageClientProps {
  vendor: VendorProfile;
  locale: string;
  products: Product[];
  pagination: PaginationMeta;
  filterOptions: FilterOptions;
  initialReviews: ApiReview[];
  reviewsPagination: PaginationMeta;
}

export default function VendorPageClient({
  vendor,
  locale,
  products,
  pagination,
  filterOptions,
  initialReviews,
  reviewsPagination,
}: VendorPageClientProps) {
  const t = useTranslations("vendor");
  const tCategory = useTranslations("categoryPage");

  const [activeTab, setActiveTab] = useState<VendorTab>("products");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const minPrice = getParam("minPrice");
  const maxPrice = getParam("maxPrice");
  const onSale = getParam("onSale") === "true";
  const sortBy = getParam("sortBy");
  const sortOrder = getParam("sortOrder");

  const handleTabChange = useCallback(
    (tab: VendorTab) => {
      setActiveTab(tab);
      if (tab === "offers") {
        updateFilter("onSale", "true");
      } else if (onSale) {
        updateFilter("onSale", null);
      }
    },
    [updateFilter, onSale],
  );

  const handleSort = (newSortBy: string, newSortOrder: string) => {
    updateFilter("sortBy", newSortBy || null);
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

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        updateFilter("page", null);
        // search is handled via URL — need to add to useFilters
        // For now we use the built-in approach
        const params = new URLSearchParams(window.location.search);
        if (value.trim()) {
          params.set("search", value.trim());
        } else {
          params.delete("search");
        }
        params.delete("page");
        const url = params.toString()
          ? `${window.location.pathname}?${params.toString()}`
          : window.location.pathname;
        window.history.replaceState(null, "", url);
        window.location.reload();
      }, 500);
    },
    [updateFilter],
  );

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: vendor.storeName, url });
      } else {
        await navigator.clipboard.writeText(url);
        // Could add a toast notification here
      }
    } catch {
      // user cancelled share
    }
  };

  const sidebarProps = {
    filterOptions,
    selectedBrandIds,
    selectedColorIds,
    selectedSizeIds,
    selectedMaterialIds,
    selectedPatternIds,
    selectedSubcategoryIds: [] as string[],
    minPrice,
    maxPrice,
    onSale,
    onToggleBrand: (id: string) => toggleFilterId("brandId", id),
    onToggleColor: (id: string) => toggleFilterId("colorId", id),
    onToggleSize: (id: string) => toggleFilterId("sizeId", id),
    onToggleMaterial: (id: string) => toggleFilterId("materialId", id),
    onTogglePattern: (id: string) => toggleFilterId("patternId", id),
    onToggleSubcategory: () => {},
    onPriceApply: handlePriceApply,
    onToggleSale: handleToggleSale,
    onClearAll: clearAllFilters,
    hasActiveFilters,
  };

  const showProductsContent = activeTab === "products" || activeTab === "offers";

  return (
    <>
      <VendorHeader
        vendor={vendor}
        locale={locale}
        onRequireLogin={() => setLoginOpen(true)}
      />

      <VendorTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onShare={handleShare}
      />

      {showProductsContent && (
        <>
          {/* Header row with results count + sort + mobile filter button */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-text">
              {tCategory("showedResults", { count: pagination.total })}
            </p>
            <div className="flex items-center gap-3">
              <SortDropdown
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-border px-3 py-1.5 text-xs text-dark lg:hidden"
              >
                <SlidersHorizontal size={14} />
                {tCategory("filters.showFilters")}
              </button>
            </div>
          </div>

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
      )}

      {activeTab === "reviews" && (
        <VendorReviews
          vendorId={vendor.id}
          initialReviews={initialReviews}
          initialPagination={reviewsPagination}
          onRequireLogin={() => setLoginOpen(true)}
        />
      )}

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
