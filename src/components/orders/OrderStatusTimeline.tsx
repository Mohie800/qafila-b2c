"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  ShoppingBag,
  CheckCircle,
  Package,
  Truck,
  CircleCheck,
  Clock,
} from "lucide-react";
import type { OrderStatus } from "@/types/order";

const TIMELINE_STEPS: {
  key: string;
  icon: typeof ShoppingBag;
  statuses: OrderStatus[];
}[] = [
  { key: "orderPlaced", icon: ShoppingBag, statuses: ["PLACED", "PENDING"] },
  { key: "confirmed", icon: CheckCircle, statuses: ["CONFIRMED"] },
  { key: "packed", icon: Package, statuses: ["PACKED"] },
  { key: "shipped", icon: Truck, statuses: ["SHIPPED"] },
  { key: "delivered", icon: CircleCheck, statuses: ["DELIVERED"] },
];

// Order of statuses for progress calculation
const STATUS_ORDER: OrderStatus[] = [
  "PENDING",
  "PLACED",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
];

interface Props {
  status: OrderStatus;
  createdAt: string;
}

export default function OrderStatusTimeline({ status, createdAt }: Props) {
  const t = useTranslations("orders");
  const locale = useLocale();

  const currentIndex = STATUS_ORDER.indexOf(status);
  const isCancelled = status === "CANCELLED" || status === "REFUNDED";

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-discount/5 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-discount/10">
          <Clock size={20} className="text-discount" />
        </div>
        <div>
          <p className="text-sm font-semibold text-discount">
            {t(status.toLowerCase() as any)}
          </p>
          <p className="text-xs text-gray-text">
            {t(`statusDescriptions.${status}`)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {TIMELINE_STEPS.map((step, i) => {
        // A step is "reached" if the current status is at or past it
        const stepMaxIndex = Math.max(
          ...step.statuses.map((s) => STATUS_ORDER.indexOf(s)),
        );
        const isReached = currentIndex >= stepMaxIndex;
        const isCurrentStep = step.statuses.includes(status);
        const Icon = step.icon;
        const isLast = i === TIMELINE_STEPS.length - 1;

        return (
          <div key={step.key} className="flex gap-3">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isReached
                    ? "bg-dark text-white"
                    : "border-2 border-gray-border dark:border-gray-600 bg-white dark:bg-dark text-gray-text"
                }`}
              >
                <Icon size={14} />
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-8 ${
                    isReached && !isCurrentStep ? "bg-dark" : "bg-gray-border"
                  }`}
                />
              )}
            </div>

            {/* Text */}
            <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
              <p
                className={`text-sm font-semibold ${
                  isReached ? "text-dark dark:text-gray-100" : "text-gray-text"
                }`}
              >
                {t(step.key as any)}
                {isReached && (
                  <span className="ms-2 text-xs font-normal text-gray-text">
                    {formatDate(createdAt)}
                  </span>
                )}
              </p>
              {isCurrentStep && (
                <p className="mt-0.5 text-xs text-gray-text">
                  {t(`statusDescriptions.${status}`)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
