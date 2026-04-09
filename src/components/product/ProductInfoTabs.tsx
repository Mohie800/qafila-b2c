"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface ProductInfoTabsProps {
  details: { label: string; value: string }[];
  deliveryLines: React.ReactNode[];
}

export default function ProductInfoTabs({
  details,
  deliveryLines,
}: ProductInfoTabsProps) {
  const t = useTranslations("productDetail");
  const [activeTab, setActiveTab] = useState<"details" | "delivery">("details");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-dark p-1">
        <button
          onClick={() => setActiveTab("details")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === "details"
              ? "bg-dark text-white"
              : "text-dark dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {t("designDetails")}
        </button>
        <button
          onClick={() => setActiveTab("delivery")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === "delivery"
              ? "bg-dark text-white"
              : "text-dark dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {t("deliveryAndReturns")}
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-1 rounded-lg bg-gray-50 dark:bg-dark/50 p-4">
        {activeTab === "details" ? (
          <ul className="space-y-2 text-sm text-dark dark:text-gray-200">
            {details.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                <span>
                  {item.label}: {item.value}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-2 text-sm text-dark dark:text-gray-200">
            {deliveryLines.map((line, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
