"use client";

import { FeatureGate } from "@/components/subscription/feature-gate";
import ResearchClient from "./ResearchClient";

/**
 * Wraps ResearchClient with a feature gate.
 * The feature key "aiResearch.toolAccess" must be enabled in the user's plan.
 */
export default function ResearchPageClient() {
  return (
    <FeatureGate feature="aiResearch.toolAccess" featureLabel="AI Research">
      <ResearchClient />
    </FeatureGate>
  );
}
