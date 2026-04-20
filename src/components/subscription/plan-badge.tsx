"use client";

import { useLocale } from "next-intl";
import { useSubscription } from "@/lib/subscription-context";

interface PlanBadgeProps {
  className?: string;
}

export function PlanBadge({ className = "" }: PlanBadgeProps) {
  const locale = useLocale();
  const { subscription } = useSubscription();

  if (!subscription?.plan) return null;

  const planName =
    locale === "ar" ? subscription.plan.nameAr : subscription.plan.name;

  return (
    <span
      className={`inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ${className}`}
    >
      {planName}
    </span>
  );
}
