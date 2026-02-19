"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getFaqCategories, getFaqs } from "@/lib/api/faqs";
import type { FaqCategory, Faq } from "@/types/faq";
import FaqAccordion from "./FaqAccordion";

export default function FaqsPageClient() {
  const locale = useLocale();
  const t = useTranslations("faqs");
  const isAr = locale === "ar";

  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [cats, items] = await Promise.all([
          getFaqCategories(true),
          getFaqs(undefined, true),
        ]);
        setCategories(cats);
        setFaqs(items);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const grouped = categories.map((cat) => ({
    id: cat.id,
    name: isAr ? cat.nameAr : cat.nameEn,
    items: faqs
      .filter((faq) => faq.categoryId === cat.id)
      .map((faq) => ({
        id: faq.id,
        question: isAr ? faq.questionAr : faq.questionEn,
        answer: isAr ? faq.answerAr : faq.answerEn,
      })),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-[--color-dark]">{t("title")}</h1>
      <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>

      {loading ? (
        <div className="mt-10 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
        </div>
      ) : error ? (
        <p className="mt-10 text-center text-sm text-red-500">{t("error")}</p>
      ) : (
        <div className="mt-8">
          <FaqAccordion categories={grouped} />
        </div>
      )}
    </div>
  );
}
