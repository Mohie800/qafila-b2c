"use client";

interface UsageMeterProps {
  label: string;
  used: number;
  limit: number;
  periodType: "DAILY" | "WEEKLY" | "MONTHLY";
}

export function UsageMeter({ label, used, limit, periodType }: UsageMeterProps) {
  const isUnlimited = limit === -1;
  const isDisabled = limit === 0;

  const pct = isUnlimited || isDisabled ? 0 : Math.min(100, (used / limit) * 100);

  const barColor =
    pct >= 90
      ? "bg-red-500"
      : pct >= 70
        ? "bg-yellow-500"
        : "bg-green-500";

  const periodLabel: Record<UsageMeterProps["periodType"], string> = {
    DAILY: "today",
    WEEKLY: "this week",
    MONTHLY: "this month",
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-dark dark:text-gray-100">{label}</span>
        <span className="text-gray-text text-xs">
          {isDisabled ? (
            "Not available"
          ) : isUnlimited ? (
            `${used} used ${periodLabel[periodType]} · Unlimited`
          ) : (
            `${used} / ${limit} ${periodLabel[periodType]}`
          )}
        </span>
      </div>
      {!isDisabled && !isUnlimited && (
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-2 rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {isUnlimited && (
        <div className="h-2 w-full rounded-full bg-primary/20">
          <div className="h-2 w-full rounded-full bg-primary/60" />
        </div>
      )}
      {isDisabled && (
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
      )}
    </div>
  );
}
