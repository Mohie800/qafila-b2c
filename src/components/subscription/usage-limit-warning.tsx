"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@/i18n/navigation";

interface UsageLimitWarningProps {
  featureLabel: string;
  used: number;
  limit: number;
  periodLabel?: string;
  /** If true, the user has already hit the limit */
  isAtLimit?: boolean;
}

/**
 * Banner shown when a user is approaching or has reached a usage limit.
 *
 * Usage:
 *   const usage = getUsageFor("aiResearch.dailyQueries");
 *   {usage && usage.used / usage.limit >= 0.7 && (
 *     <UsageLimitWarning
 *       featureLabel="AI queries"
 *       used={usage.used}
 *       limit={usage.limit}
 *       isAtLimit={usage.used >= usage.limit}
 *     />
 *   )}
 */
export function UsageLimitWarning({
  featureLabel,
  used,
  limit,
  periodLabel = "today",
  isAtLimit,
}: UsageLimitWarningProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const bgClass = isAtLimit
    ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
    : "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800";
  const textClass = isAtLimit ? "text-red-700 dark:text-red-400" : "text-yellow-700 dark:text-yellow-400";
  const iconClass = isAtLimit ? "text-red-500" : "text-yellow-500";

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3 ${bgClass}`}>
      <AlertTriangle size={16} className={`shrink-0 mt-0.5 ${iconClass}`} />
      <p className={`flex-1 text-sm ${textClass}`}>
        {isAtLimit ? (
          <>
            You&apos;ve used all {limit} {featureLabel} {periodLabel}.{" "}
            <Link href="/pricing" className="font-medium underline">
              Upgrade for more
            </Link>
            .
          </>
        ) : (
          <>
            You&apos;ve used {used} of {limit} {featureLabel} {periodLabel}.
          </>
        )}
      </p>
      <button onClick={() => setDismissed(true)} className={`shrink-0 ${textClass} hover:opacity-70`}>
        <X size={14} />
      </button>
    </div>
  );
}
