"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import TopicPill from "./TopicPill";

const TOPIC_PILLS = [
  "Saudi Fashion",
  "Fashion Goods",
  "E-commerce worldwide",
  "Fashion",
  "Artificial Intelligence",
  "GCC Retail",
  "Fashion Trends 2025",
];

interface ResearchHeroProps {
  onSearch: (query: string) => void;
}

export default function ResearchHero({ onSearch }: ResearchHeroProps) {
  const t = useTranslations("research");
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-dark px-6 py-16 text-center">
      {/* Title */}
      <h1 className="mb-3 text-4xl font-bold leading-tight md:text-5xl">
        <span className="text-primary">{t("heroTitle1")} </span>
        <span className="text-white">{t("heroTitle2")}</span>
      </h1>

      {/* Subtitle */}
      <p className="mb-10 max-w-xl text-base text-gray-400">{t("heroSubtitle")}</p>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="mb-8 w-full max-w-xl">
        <div className="flex items-center gap-2 rounded-full bg-gray-800 px-5 py-3 ring-1 ring-gray-700 transition-all focus-within:ring-primary">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity hover:opacity-80 disabled:opacity-40"
            aria-label="Search"
          >
            <Search size={16} />
          </button>
        </div>
      </form>

      {/* Topic pills */}
      <div className="flex max-w-lg flex-wrap justify-center gap-2">
        {TOPIC_PILLS.map((pill) => (
          <TopicPill
            key={pill}
            label={pill}
            onClick={onSearch}
          />
        ))}
      </div>
    </div>
  );
}
