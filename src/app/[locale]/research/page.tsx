import { Metadata } from "next";
import ResearchClient from "@/components/research/ResearchClient";

export const metadata: Metadata = {
  title: "Research AI — Qafila",
  description:
    "Insights and facts across 170 industries and 150+ countries, powered by AI.",
};

export default function ResearchPage() {
  return <ResearchClient />;
}
