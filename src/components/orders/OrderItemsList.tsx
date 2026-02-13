"use client";

import { useTranslations } from "next-intl";
import { ChevronRight, Package } from "lucide-react";
import Image from "next/image";
import type { OrderItemResponse } from "@/types/order";

interface Props {
  items: OrderItemResponse[];
  locale: string;
}

export default function OrderItemsList({ items, locale }: Props) {
  const t = useTranslations("orders");

  return (
    <div className="divide-y divide-gray-border">
      {items.map((item) => {
        const title =
          locale === "ar" ? item.productTitleAr : item.productTitle;
        const isCancelled = item.status === "CANCELLED";

        // Variant display
        const variantParts: string[] = [];
        if (item.variantDetails) {
          const v = item.variantDetails;
          if (v.color) {
            variantParts.push(locale === "ar" && v.colorAr ? v.colorAr : v.color);
          }
          if (v.size) {
            variantParts.push(locale === "ar" && v.sizeAr ? v.sizeAr : v.size);
          }
        }

        return (
          <div
            key={item.id}
            className={`flex items-center gap-4 py-4 ${isCancelled ? "opacity-50" : ""}`}
          >
            {/* Image */}
            <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-light">
              {item.productImage ? (
                <Image
                  src={item.productImage}
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
              <p className="mt-1 text-sm font-bold text-dark">
                {t("sar")} {Number(item.price).toFixed(1)}
                {item.quantity > 1 && (
                  <span className="ms-1 text-xs font-normal text-gray-text">
                    x{item.quantity}
                  </span>
                )}
              </p>
              {isCancelled && (
                <span className="text-[10px] font-medium text-discount">
                  {t("cancelled")}
                </span>
              )}
            </div>

            <ChevronRight
              size={16}
              className="shrink-0 text-gray-text rtl:rotate-180"
            />
          </div>
        );
      })}
    </div>
  );
}
