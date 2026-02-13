"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface ProductAccordionProps {
  sections: AccordionSection[];
  defaultOpen?: string;
}

export default function ProductAccordion({
  sections,
  defaultOpen,
}: ProductAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpen ?? null);

  return (
    <div className="divide-y divide-gray-border border-t border-gray-border">
      {sections.map((section) => {
        const isOpen = openId === section.id;
        return (
          <div key={section.id}>
            <button
              onClick={() => setOpenId(isOpen ? null : section.id)}
              className="flex w-full items-center justify-between py-3.5 text-sm font-semibold text-dark"
              aria-expanded={isOpen}
            >
              {section.title}
              <ChevronDown
                size={16}
                className={`text-gray-text transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="pb-4 text-sm leading-relaxed text-gray-text">
                {section.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
