"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FilterAccordionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function FilterAccordion({
  title,
  defaultOpen = true,
  children,
}: FilterAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-border dark:border-gray-700 py-4">
      <button
        type="button"
        className="flex w-full items-center justify-between text-sm font-semibold text-dark dark:text-gray-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <ChevronDown
          size={16}
          className={`text-gray-text transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
