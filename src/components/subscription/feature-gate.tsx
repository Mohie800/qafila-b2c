"use client";

import type { ReactNode } from "react";
import { useSubscription } from "@/lib/subscription-context";
import { UpgradePrompt } from "./upgrade-prompt";

interface FeatureGateProps {
  /** Dot-notation feature key matching the plan's features JSON (e.g. "aiResearch.toolAccess") */
  feature: string;
  /** Rendered when the feature is not available. Defaults to <UpgradePrompt />. */
  fallback?: ReactNode;
  /** Human-readable label shown in the default UpgradePrompt */
  featureLabel?: string;
  children: ReactNode;
}

/**
 * Renders children only when the user's plan includes the specified feature.
 *
 * Usage:
 *   <FeatureGate feature="aiResearch.toolAccess" featureLabel="AI Research">
 *     <AIResearchTool />
 *   </FeatureGate>
 */
export function FeatureGate({ feature, fallback, featureLabel, children }: FeatureGateProps) {
  const { hasFeature, isLoading } = useSubscription();

  // While loading, render nothing (avoids flash of locked state for paid users)
  if (isLoading) return null;

  if (!hasFeature(feature)) {
    return <>{fallback ?? <UpgradePrompt featureLabel={featureLabel} />}</>;
  }

  return <>{children}</>;
}
