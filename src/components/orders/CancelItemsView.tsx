"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { ArrowLeft, Package, X } from "lucide-react";
import SarIcon from "@/components/shared/SarIcon";
import Image from "next/image";
import { getMediaUrl } from "@/lib/utils";
import { cancelOrderItem } from "@/lib/api/orders";
import type { OrderResponse, OrderItemResponse, CancellationReason } from "@/types/order";

const CANCEL_REASONS: { key: CancellationReason; translationKey: string }[] = [
  { key: "CHANGED_MIND", translationKey: "CHANGED_MIND" },
  { key: "NO_LONGER_NEEDED", translationKey: "NO_LONGER_NEEDED" },
  { key: "BELIEVE_FAKE", translationKey: "BELIEVE_FAKE" },
  { key: "NO_REASON", translationKey: "NO_REASON" },
];

interface Props {
  order: OrderResponse;
  onBack: () => void;
  onCancelled: () => void;
}

export default function CancelItemsView({ order, onBack, onCancelled }: Props) {
  const t = useTranslations("orders");
  const locale = useLocale();

  const allItems = order.vendorOrders.flatMap((vo) => vo.items);
  const activeItems = allItems.filter((i) => i.status === "ACTIVE");

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<CancellationReason>("CHANGED_MIND");
  const [cancelling, setCancelling] = useState(false);

  const itemCount = activeItems.reduce((s, i) => s + i.quantity, 0);

  const handleCancelClick = () => {
    if (!selectedItemId) return;
    setShowReasonModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedItemId) return;
    setCancelling(true);
    try {
      await cancelOrderItem(order.id, selectedItemId, selectedReason);
      setShowReasonModal(false);
      onCancelled();
    } catch {
      // error
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-dark"
      >
        <ArrowLeft size={18} className="rtl:rotate-180" />
        {t("cancelItem")}
      </button>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: items with checkboxes */}
        <div className="lg:col-span-3 rounded-xl border border-gray-border dark:border-gray-700 bg-white dark:bg-dark p-6">
          <h2 className="mb-4 text-base font-bold text-dark dark:text-gray-100">
            {t("itemsSummary")} ({itemCount}{" "}
            {itemCount > 1 ? t("items", { count: itemCount }) : t("item", { count: itemCount })})
          </h2>

          <div className="divide-y divide-gray-border">
            {activeItems.map((item) => {
              const title =
                locale === "ar" ? item.productTitleAr : item.productTitle;
              const isSelected = selectedItemId === item.id;

              // Variant
              const variantParts: string[] = [];
              if (item.variantDetails) {
                const v = item.variantDetails;
                if (v.color)
                  variantParts.push(
                    locale === "ar" && v.colorAr ? v.colorAr : v.color,
                  );
                if (v.size)
                  variantParts.push(
                    locale === "ar" && v.sizeAr ? v.sizeAr : v.size,
                  );
              }

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-4 cursor-pointer"
                  onClick={() =>
                    setSelectedItemId(isSelected ? null : item.id)
                  }
                >
                  {/* Image */}
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-light">
                    {item.productImage ? (
                      <Image
                        src={getMediaUrl(item.productImage) || item.productImage}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package size={18} className="text-gray-text" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">
                      {title}
                    </p>
                    {variantParts.length > 0 && (
                      <p className="text-xs text-gray-text truncate">
                        {variantParts.join(" · ")}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-bold text-dark" dir="ltr">
                      <SarIcon /> {Number(item.price).toFixed(1)}
                    </p>
                  </div>

                  {/* Checkbox */}
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      isSelected
                        ? "border-dark bg-dark"
                        : "border-gray-border dark:border-gray-600 bg-white dark:bg-dark"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        width="12"
                        height="10"
                        viewBox="0 0 12 10"
                        fill="none"
                      >
                        <path
                          d="M1 5L4.5 8.5L11 1.5"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: warning + button */}
        <div className="lg:col-span-2 rounded-xl border border-gray-border dark:border-gray-700 bg-white dark:bg-dark p-6 self-start">
          <p className="mb-4 text-sm text-gray-text">
            {selectedItemId ? t("cannotBeReversed") : t("noItemSelected")}
          </p>
          <button
            onClick={handleCancelClick}
            disabled={!selectedItemId}
            className={`w-full rounded-full py-3 text-sm font-semibold transition-colors ${
              selectedItemId
                ? "bg-dark text-white hover:bg-dark/90"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {t("cancelTheSelectedItem")}
          </button>
        </div>
      </div>

      {/* Reason modal */}
      {showReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-dark p-6">
            {/* Modal header */}
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-dark dark:text-gray-100">
                {t("reasonForCancellation")}
              </h3>
              <button
                onClick={() => setShowReasonModal(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X size={20} className="text-gray-text" />
              </button>
            </div>

            {/* Reason radio list */}
            <div className="space-y-1">
              {CANCEL_REASONS.map((reason) => (
                <label
                  key={reason.key}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-3 hover:bg-gray-50 dark:hover:bg-dark/80"
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      selectedReason === reason.key
                        ? "border-dark"
                        : "border-gray-border"
                    }`}
                  >
                    {selectedReason === reason.key && (
                      <div className="h-2.5 w-2.5 rounded-full bg-dark" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="cancel-reason"
                    value={reason.key}
                    checked={selectedReason === reason.key}
                    onChange={() => setSelectedReason(reason.key)}
                    className="sr-only"
                  />
                  <span className="text-sm text-dark dark:text-gray-200">
                    {t(`reasons.${reason.translationKey}` as any)}
                  </span>
                </label>
              ))}
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="mt-5 w-full rounded-full bg-dark py-3.5 text-sm font-semibold text-white transition-colors hover:bg-dark/90 disabled:opacity-50"
            >
              {cancelling ? t("cancelling") : t("confirmCancellation")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
