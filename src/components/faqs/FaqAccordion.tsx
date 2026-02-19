"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqCategoryGroup {
  id: string;
  name: string;
  items: FaqItem[];
}

export default function FaqAccordion({
  categories,
}: {
  categories: FaqCategoryGroup[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <section key={category.id}>
          <h2 className="mb-2 text-base font-semibold text-[--color-dark]">
            {category.name}
          </h2>

          <div className="divide-y divide-gray-200 border-t border-gray-200">
            {category.items.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    className="flex w-full items-center justify-between py-4 text-start text-sm text-[--color-dark] transition-colors hover:text-[--color-primary]"
                  >
                    <span className="pe-4 font-medium">{item.question}</span>
                    <ChevronDown
                      className={`size-5 shrink-0 text-gray-500 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-200 ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-4 text-sm leading-relaxed text-gray-500">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
