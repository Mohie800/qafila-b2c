"use client";

import { Lock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSubscription } from "@/lib/subscription-context";
import { useLocale } from "next-intl";

interface UpgradePromptProps {
  featureLabel?: string;
  className?: string;
}

export function UpgradePrompt({ featureLabel, className = "" }: UpgradePromptProps) {
  const { subscription } = useSubscription();
  const locale = useLocale();

  const planName = subscription?.plan
    ? locale === "ar"
      ? subscription.plan.nameAr
      : subscription.plan.name
    : null;

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-border dark:border-gray-600 bg-gray-50 dark:bg-gray-800/40 p-8 text-center ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Lock size={22} className="text-primary" />
      </div>
      <div>
        <p className="font-semibold text-dark dark:text-gray-100">
          {featureLabel ? `"${featureLabel}" requires an upgrade` : "Upgrade Required"}
        </p>
        {planName && (
          <p className="mt-1 text-sm text-gray-text">
            This feature is not available on the <span className="font-medium">{planName}</span> plan.
          </p>
        )}
      </div>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
      >
        View Plans
      </Link>
    </div>
  );
}
