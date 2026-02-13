"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
}

export default function Carousel({ children, className = "" }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="group relative">
      <button
        onClick={() => scroll("left")}
        className="absolute -start-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-opacity group-hover:flex hover:bg-gray-50"
        aria-label="Scroll left"
      >
        <ChevronLeft size={20} className="rtl:rotate-180" />
      </button>

      <div
        ref={scrollRef}
        className={`scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth ${className}`}
      >
        {children}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute -end-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-opacity group-hover:flex hover:bg-gray-50"
        aria-label="Scroll right"
      >
        <ChevronRight size={20} className="rtl:rotate-180" />
      </button>
    </div>
  );
}
