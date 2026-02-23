"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Share2 } from "lucide-react";

export type VendorTab = "products" | "offers" | "reviews";

interface VendorTabsProps {
  activeTab: VendorTab;
  onTabChange: (tab: VendorTab) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onShare: () => void;
}

export default function VendorTabs({
  activeTab,
  onTabChange,
  searchValue,
  onSearchChange,
  onShare,
}: VendorTabsProps) {
  const t = useTranslations("vendor");
  const [searchOpen, setSearchOpen] = useState(false);

  const tabs: { key: VendorTab; label: string }[] = [
    { key: "products", label: t("allProducts") },
    { key: "offers", label: t("specialOffers") },
    { key: "reviews", label: t("reviews") },
  ];

  return (
    <div className="mb-6 border-b border-gray-200">
      <div className="flex items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-dark text-dark"
                  : "border-transparent text-gray-text hover:text-dark"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + Share */}
        <div className="flex shrink-0 items-center gap-2">
          {searchOpen ? (
            <div className="flex items-center gap-2 rounded-lg border border-gray-border px-3 py-1.5">
              <Search size={14} className="text-gray-text" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t("searchInStore")}
                className="w-32 bg-transparent text-xs outline-none placeholder:text-gray-300 sm:w-48"
                autoFocus
                onBlur={() => {
                  if (!searchValue) setSearchOpen(false);
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-lg border border-gray-border p-2 text-gray-text transition-colors hover:text-dark"
            >
              <Search size={16} />
            </button>
          )}

          <button
            onClick={onShare}
            className="rounded-lg border border-gray-border p-2 text-gray-text transition-colors hover:text-dark"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
