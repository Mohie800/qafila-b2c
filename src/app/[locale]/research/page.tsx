import { Metadata } from "next";
import ResearchPageClient from "@/components/research/ResearchPageClient";

export const metadata: Metadata = {
  title: "Research AI — Qafila",
  description:
    "Insights and facts across 170 industries and 150+ countries, powered by AI.",
};

export default function ResearchPage() {
  return <ResearchPageClient />;
}
