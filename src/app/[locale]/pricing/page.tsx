"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { getPlans } from "@/lib/api/plans";
import { useSubscription } from "@/lib/subscription-context";
import { useAuth } from "@/lib/auth-context";
import { Check, ChevronRight, Minus, ArrowRight } from "lucide-react";
import SarIcon from "@/components/shared/SarIcon";
import type { SubscriptionPlan, PlanSegment } from "@/lib/api/plans";
import Image from "next/image";
import { SubscribeModal } from "@/components/subscription/subscribe-modal";
import LoginModal from "@/components/auth/LoginModal";

// ─── Feature groups ──────────────────────────────────────────────────────────
const FEATURE_GROUPS: Record<string, { label: string; emoji: string }> = {
  reviews: { label: "Reviews", emoji: "🔥" },
  statista: { label: "Statista", emoji: "📊" },
  aiResearch: { label: "AI Research", emoji: "✨" },
  reports: { label: "Reports", emoji: "📄" },
  licenses: { label: "Licenses", emoji: "🔑" },
};

// ─── Segment config ───────────────────────────────────────────────────────────
const SEGMENT_CONFIG: Record<PlanSegment, { label: string; code: string }> = {
  INDIVIDUAL: { label: "Individual", code: "A" },
  BUSINESS: { label: "Business", code: "B+C" },
  GOVERNMENT: { label: "Government", code: "G+C" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function featureLabel(key: string): string {
  // "aiResearch.dailyQueryLimit" → "Daily Query Limit"
  const parts = key.split(".");
  const name = parts[parts.length - 1];
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function groupKey(key: string): string {
  return key.split(".")[0] ?? "other";
}

function groupFeatureKeys(plans: SubscriptionPlan[]): Record<string, string[]> {
  const allKeys = Array.from(
    new Set(
      plans.flatMap((p) => Object.keys(p.features as Record<string, unknown>)),
    ),
  );

  const groups: Record<string, string[]> = {};
  for (const key of allKeys) {
    const g = groupKey(key);
    if (!groups[g]) groups[g] = [];
    groups[g].push(key);
  }
  return groups;
}

// ─── Cell renderer ────────────────────────────────────────────────────────────
function CellValue({ value }: { value: unknown }) {
  if (value === null || value === undefined)
    return <Minus size={14} className="mx-auto text-gray-300" />;

  if (typeof value === "boolean") {
    return value ? (
      <Check size={15} className="mx-auto text-green" strokeWidth={2.5} />
    ) : (
      <Minus size={15} className="mx-auto text-gray-300" />
    );
  }

  if (typeof value === "number") {
    if (value === 0)
      return <Minus size={15} className="mx-auto text-gray-300" />;
    if (value === -1)
      return (
        <span className="text-xs font-semibold text-green">Unlimited</span>
      );
    return (
      <span className="text-xs font-semibold text-dark dark:text-gray-100">
        {value}
      </span>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0)
      return <Minus size={15} className="mx-auto text-gray-300" />;
    return (
      <span className="text-xs text-dark dark:text-gray-200 leading-tight">
        {(value as string[]).join(" / ")}
      </span>
    );
  }

  return (
    <span className="text-xs text-dark dark:text-gray-200">
      {String(value)}
    </span>
  );
}

// ─── Mini feature list for plan card ─────────────────────────────────────────
function planHighlights(plan: SubscriptionPlan): string[] {
  const features = plan.features as Record<string, unknown>;
  const highlights: string[] = [];

  for (const [key, val] of Object.entries(features)) {
    if (highlights.length >= 5) break;
    let included = false;
    if (typeof val === "boolean") included = val;
    else if (typeof val === "number") included = val !== 0;
    else if (Array.isArray(val)) included = val.length > 0;
    if (included) highlights.push(featureLabel(key));
  }

  return highlights;
}

// ─── Plan card ────────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  locale,
  billingCycle,
  isCurrentPlan,
  isFeatured,
  onSubscribe,
}: {
  plan: SubscriptionPlan;
  locale: string;
  billingCycle: "monthly" | "annually";
  isCurrentPlan: boolean;
  isFeatured: boolean;
  onSubscribe: (plan: SubscriptionPlan) => void;
}) {
  const planName = locale === "ar" ? plan.nameAr : plan.name;
  const price =
    billingCycle === "annually"
      ? plan.priceAnnually || 0
      : plan.priceMonthly || 0;
  const isFree = plan.priceMonthly === 0;
  const highlights = planHighlights(plan);

  return (
    <div
      className={`relative flex flex-col rounded-md bg-white overflow-visible  w-full max-w-60 ${
        isFeatured ? "ring-1 ring-black" : "ring-1 ring-white/10"
      }`}
    >
      {/* Card header stripe */}
      {isFeatured && (
        <span className="mb-2 absolute -top-2 left-4 inline-block rounded-full bg-black px-3 py-0.5 text-[11px] font-bold text-white uppercase tracking-wide">
          Most Popular
        </span>
      )}
      <div className={`px-5 pt-5 pb-4 `}>
        {isCurrentPlan && !isFeatured && (
          <span className="mb-2 inline-block rounded-full bg-green/10 border border-green/30 px-3 py-0.5 text-[11px] font-semibold text-green">
            Current Plan
          </span>
        )}
        <h3 className="text-base font-bold text-dark">{planName}</h3>
        <div className="mt-2 flex items-baseline gap-1" dir="ltr">
          {isFree ? (
            <span className="text-3xl font-extrabold text-dark">
              <SarIcon className="text-2xl" /> 0.0
            </span>
          ) : (
            <>
              <span className="text-3xl font-extrabold text-dark">
                <SarIcon className="text-2xl" /> {price.toLocaleString()}
              </span>
              <span className="text-xs text-gray-text">/month</span>
            </>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 py-3 border-b border-gray-100">
        {isCurrentPlan ? (
          <span className="block w-full rounded-xl border-2 border-primary bg-primary/5 py-2.5 text-center text-sm font-semibold text-primary">
            Current Plan
          </span>
        ) : (
          <button
            onClick={() => onSubscribe(plan)}
            className={`block w-full rounded-xl py-2.5 text-center text-sm font-semibold transition-colors ${
              isFeatured
                ? "bg-black text-white hover:bg-primary-hover"
                : "border border-gray-border text-dark hover:bg-gray-50"
            }`}
          >
            {isFree ? "Start for Free" : "Select Plan"}
          </button>
        )}
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="px-5 py-4 flex-1">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-text">
            What&apos;s Included
          </p>
          <ul className="space-y-2">
            {highlights.map((label) => (
              <li
                key={label}
                className="flex items-start gap-2 text-sm text-dark"
              >
                <Check size={13} className="mt-0.5 shrink-0 text-primary" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const locale = useLocale();
  const { isLoggedIn } = useAuth();
  const { subscription } = useSubscription();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "monthly",
  );
  const [activeSegment, setActiveSegment] = useState<PlanSegment | "ALL">(
    "ALL",
  );
  const [subscribingPlan, setSubscribingPlan] = useState<SubscriptionPlan | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (!isLoggedIn) {
      setSubscribingPlan(plan); // remember so SubscribeModal opens after login
      setLoginModalOpen(true);
    } else {
      setSubscribingPlan(plan);
    }
  };

  const handleLoginClose = () => {
    setLoginModalOpen(false);
    // If the user closed without logging in, clear the pending plan
    if (!isLoggedIn) {
      setSubscribingPlan(null);
    }
  };

  useEffect(() => {
    getPlans({ isActive: true, limit: 50 })
      .then((res) => setPlans(res.data))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const availableSegments = Array.from(
    new Set(plans.map((p) => p.segment)),
  ) as PlanSegment[];

  const filteredPlans =
    activeSegment === "ALL"
      ? plans
      : plans.filter((p) => p.segment === activeSegment);
  const sortedPlans = [...filteredPlans].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  // Feature table structure
  const featureGroups = groupFeatureKeys(sortedPlans);
  const groupOrder = [
    "reviews",
    "statista",
    "aiResearch",
    "reports",
    "licenses",
  ];
  const orderedGroups = [
    ...groupOrder.filter((g) => featureGroups[g]),
    ...Object.keys(featureGroups).filter((g) => !groupOrder.includes(g)),
  ];

  // Determine featured plan (highest tier among paid plans)
  const featuredPlan = sortedPlans.reduce<SubscriptionPlan | null>(
    (best, p) => {
      if (p.priceMonthly === 0) return best;
      if (!best) return p;
      return p.tier > best.tier ? p : best;
    },
    null,
  );

  return (
    <>
      {/* ── Hero section (dark warm background) ───────────────────── */}
      <section
        className="relative overflow-hidden bg-[#F5F5F5] dark:bg-[#160700]"
        // style={{ backgroundColor: "#160700" }}
      >
        {/* Orange diagonal stripe – right side accent */}
        {/* <div
          className="pointer-events-none absolute inset-y-0 end-0 w-[38%]"
          style={{
            background: "linear-gradient(135deg, transparent 30%, #e8983a 30%)",
          }}
        /> */}
        {/* Subtle warm glow behind title */}
        <Image
          src={"/images/patterns2.svg"}
          alt="patterns"
          height={400}
          width={600}
          className="absolute bottom-0 w-full"
        />
        <div
          className="pointer-events-none absolute -top-20 left-2/5 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "#e8983a" }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-14 pb-0">
          {/* Title */}
          <div className=" text-center">
            <h1 className="text-3xl font-extrabold leading-tight text-dark dark:text-white sm:text-4xl">
              Expert-verified market &amp; consumer data to support every
              decision
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-gray-500 dark:text-white/60">
              From free stats to full market coverage, choose the plan that fits
              your research needs
            </p>
          </div>

          {/* Segment tabs */}
          {availableSegments.length > 1 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {availableSegments.map((seg) => {
                const cfg = SEGMENT_CONFIG[seg];
                const isActive = activeSegment === seg;
                return (
                  <button
                    key={seg}
                    onClick={() => setActiveSegment(seg)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "border-white bg-white text-dark"
                        : "border-white/30 text-white/70 hover:border-white/70 hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isActive
                          ? "bg-dark text-white"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {cfg.code.split("+")[0]}
                    </span>
                    {cfg.label}
                    {cfg.code.includes("+") && (
                      <span className="text-[10px] opacity-60">{cfg.code}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Plan cards */}
          <div className="mt-10 pb-0 ">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              </div>
            ) : sortedPlans.length === 0 ? (
              <div className="py-16 text-center text-white/50">
                No plans available for this segment.
              </div>
            ) : (
              <div className={`flex gap-6 flex-wrap justify-center`}>
                {sortedPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    locale={locale}
                    billingCycle={billingCycle}
                    isCurrentPlan={subscription?.planId === plan.id}
                    isFeatured={featuredPlan?.id === plan.id}
                    onSubscribe={handlePlanSelect}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Compare All link */}
          {sortedPlans.length > 1 && (
            <div className="mt-6 pb-10 flex justify-center">
              <button
                onClick={() =>
                  tableRef.current?.scrollIntoView({ behavior: "smooth" })
                }
                className="flex items-center gap-1.5 rounded-md border border-white/90 cursor-pointer px-5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-white/50 hover:text-white"
              >
                Compare All-in-One Package
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Billing toggle strip ───────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-gray-border bg-white dark:bg-dark dark:border-gray-700 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <p className="text-sm font-semibold text-dark dark:text-gray-100">
            All Plans
          </p>
          <div className="flex items-center overflow-hidden rounded-full border border-gray-border dark:border-gray-700 text-sm">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-primary text-white"
                  : "text-gray-text hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annually")}
              className={`px-5 py-2 font-medium transition-colors ${
                billingCycle === "annually"
                  ? "bg-primary text-white"
                  : "text-gray-text hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Annual
              <span className="ms-1.5 rounded-full bg-green/10 px-1.5 py-0.5 text-[10px] font-bold text-green">
                SAVE
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Feature comparison table ───────────────────────────────── */}
      {!loading && sortedPlans.length > 0 && (
        <div ref={tableRef} className="bg-white dark:bg-dark">
          <div className="mx-auto max-w-6xl">
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0 text-sm">
                {/* Table header — plan names + prices */}
                <thead>
                  <tr>
                    {/* Feature column header */}
                    <th className="sticky start-0 z-10 w-52 bg-white dark:bg-dark px-6 py-5 text-start font-semibold text-dark dark:text-gray-100 border-b border-gray-border dark:border-gray-700">
                      Features
                    </th>
                    {sortedPlans.map((plan) => {
                      const price =
                        billingCycle === "annually"
                          ? plan.priceAnnually || 0
                          : plan.priceMonthly || 0;
                      const isFree = plan.priceMonthly === 0;
                      const isCurrent = subscription?.planId === plan.id;
                      const isFeat = featuredPlan?.id === plan.id;

                      return (
                        <th
                          key={plan.id}
                          className={`min-w-[140px] px-4 py-5 text-center border-b border-s border-gray-border dark:border-gray-700 ${
                            isFeat
                              ? "bg-primary/5 dark:bg-primary/10"
                              : "bg-white dark:bg-dark"
                          }`}
                        >
                          <div
                            className={`text-sm font-bold ${
                              isCurrent
                                ? "text-primary"
                                : "text-dark dark:text-gray-100"
                            }`}
                          >
                            {locale === "ar" ? plan.nameAr : plan.name}
                          </div>
                          {isCurrent && (
                            <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              Current
                            </span>
                          )}
                          <div
                            className="mt-1.5 flex items-baseline justify-center gap-0.5"
                            dir="ltr"
                          >
                            {isFree ? (
                              <span className="text-xl font-extrabold text-dark dark:text-gray-100">
                                Free
                              </span>
                            ) : (
                              <>
                                <SarIcon className="text-base text-dark dark:text-gray-100" />
                                <span className="text-xl font-extrabold text-dark dark:text-gray-100">
                                  {price?.toLocaleString()}
                                </span>
                                <span className="text-[11px] text-gray-text">
                                  /mo
                                </span>
                              </>
                            )}
                          </div>
                          <div className="mt-3">
                            {isCurrent ? (
                              <span className="inline-block rounded-lg border border-primary bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                                Current Plan
                              </span>
                            ) : (
                              <button
                                onClick={() => handlePlanSelect(plan)}
                                className={`inline-block rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                                  isFeat
                                    ? "bg-primary text-white hover:bg-primary-hover"
                                    : "border border-gray-border text-dark hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                                }`}
                              >
                                {isFree ? "Start for Free" : "Select Plan"}
                              </button>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                {/* Feature rows, grouped */}
                <tbody>
                  {orderedGroups.map((groupName) => {
                    const keys = featureGroups[groupName] ?? [];
                    const groupCfg = FEATURE_GROUPS[groupName] ?? {
                      label:
                        groupName.charAt(0).toUpperCase() + groupName.slice(1),
                      emoji: "📋",
                    };

                    return [
                      /* Group header row */
                      <tr key={`group-${groupName}`}>
                        <td
                          colSpan={sortedPlans.length + 1}
                          className="sticky start-0 border-t-2 border-gray-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-6 py-3"
                        >
                          <span className="flex items-center gap-2 text-sm font-bold text-dark dark:text-gray-100">
                            {/* <span>{groupCfg.emoji}</span> */}
                            {groupCfg.label}
                          </span>
                        </td>
                      </tr>,
                      /* Feature rows */
                      ...keys.map((key, rowIdx) => (
                        <tr
                          key={key}
                          className={
                            rowIdx % 2 === 0
                              ? "bg-white dark:bg-dark"
                              : "bg-gray-50/50 dark:bg-gray-800/20"
                          }
                        >
                          {/* Feature label */}
                          <td className="sticky start-0 z-10 border-t border-gray-border dark:border-gray-700 bg-inherit px-6 py-3.5 text-xs font-medium text-gray-text">
                            {featureLabel(key)}
                          </td>
                          {/* Plan cells */}
                          {sortedPlans.map((plan) => {
                            const features = plan.features as Record<
                              string,
                              unknown
                            >;
                            const isFeat = featuredPlan?.id === plan.id;
                            return (
                              <td
                                key={plan.id}
                                className={`border-t border-s border-gray-border dark:border-gray-700 px-4 py-3.5 text-center ${
                                  isFeat
                                    ? "bg-primary/5 dark:bg-primary/10"
                                    : "bg-inherit"
                                }`}
                              >
                                <CellValue value={features[key]} />
                              </td>
                            );
                          })}
                        </tr>
                      )),
                    ];
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Contact / CTA section ─────────────────────────────────── */}
      <section
        id="contact"
        className="border-t border-gray-border dark:border-gray-700 bg-white dark:bg-dark"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-dark dark:text-gray-100">
            Need a custom plan?
          </h2>
          <p className="mt-3 text-sm text-gray-text">
            Contact our team for enterprise pricing, bulk licenses, or any
            questions about the right plan for your needs.
          </p>
          <a
            href="mailto:support@qafila.com"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Contact Us <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {/* ── Subscribe modal (only when logged in) ─────────────────── */}
      {subscribingPlan && isLoggedIn && (
        <SubscribeModal
          plan={subscribingPlan}
          defaultBillingCycle={billingCycle}
          onClose={() => setSubscribingPlan(null)}
        />
      )}

      {/* ── Login modal (shown when guest clicks a plan) ───────────── */}
      <LoginModal open={loginModalOpen} onClose={handleLoginClose} />
    </>
  );
}
