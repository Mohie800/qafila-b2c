"use client";

import { useLocale } from "next-intl";
import { useSubscription } from "@/lib/subscription-context";
import { UsageMeter } from "@/components/subscription/usage-meter";
import { Link } from "@/i18n/navigation";
import { CreditCard, ArrowRight, RefreshCw } from "lucide-react";

const BILLING_LABELS: Record<string, string> = {
  FREE: "Free",
  MONTHLY: "Monthly",
  ANNUALLY: "Annual",
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-600",
  PAST_DUE: "bg-yellow-100 text-yellow-700",
};

export default function MySubscriptionPage() {
  const locale = useLocale();
  const { subscription, usage, isLoading, refreshSubscription } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="py-20 text-center">
        <CreditCard size={40} className="mx-auto mb-3 text-gray-300" />
        <p className="text-sm text-gray-text">No subscription found.</p>
        <Link
          href="/pricing"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          View Plans <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const plan = subscription.plan;
  const planName = locale === "ar" ? plan.nameAr : plan.name;
  const isFree = plan.priceMonthly === 0;
  const statusStyle = STATUS_STYLES[subscription.status] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-dark dark:text-gray-100">My Subscription</h1>
        <button
          onClick={refreshSubscription}
          className="flex items-center gap-1.5 text-xs text-gray-text hover:text-primary"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Plan Card */}
      <div className="rounded-2xl border border-gray-border dark:border-gray-700 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={18} className="text-primary" />
              <span className="text-xs text-gray-text uppercase tracking-wide">Current Plan</span>
            </div>
            <h2 className="text-2xl font-bold text-dark dark:text-gray-100">{planName}</h2>
            {isFree ? (
              <p className="text-sm text-gray-text mt-1">Free forever</p>
            ) : (
              <p className="text-sm text-gray-text mt-1">
                {plan.priceMonthly} {plan.currency} / mo
                {plan.priceAnnually > 0 &&
                  ` · ${plan.priceAnnually} ${plan.currency} / yr`}
              </p>
            )}
          </div>
          <div className="text-right space-y-2">
            <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${statusStyle}`}>
              {subscription.status}
            </span>
            <div className="text-xs text-gray-text">
              {BILLING_LABELS[subscription.billingCycle] ?? subscription.billingCycle}
            </div>
          </div>
        </div>

        {/* Period dates */}
        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-border dark:border-gray-700 text-sm">
          <div>
            <p className="text-xs text-gray-text mb-0.5">Period Start</p>
            <p className="font-medium text-dark dark:text-gray-100">
              {new Date(subscription.currentPeriodStart).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-text mb-0.5">Period End</p>
            <p className="font-medium text-dark dark:text-gray-100">
              {subscription.currentPeriodEnd
                ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>

        {/* Upgrade prompt for free plan */}
        {isFree && (
          <div className="mt-4 rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-dark dark:text-gray-200">
              Unlock premium features by upgrading your plan.
            </p>
            <Link
              href="/pricing"
              className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
            >
              View Plans <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* Usage Meters */}
      {usage.length > 0 && (
        <div className="rounded-2xl border border-gray-border dark:border-gray-700 p-6">
          <h3 className="font-semibold text-dark dark:text-gray-100 mb-4">Usage This Period</h3>
          <div className="space-y-5">
            {usage.map((item) => (
              <UsageMeter
                key={item.featureKey}
                label={item.featureKey}
                used={item.used}
                limit={item.limit}
                periodType={item.periodType}
              />
            ))}
          </div>
        </div>
      )}

      {/* View Plans link */}
      <div className="text-center">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Compare all plans <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
