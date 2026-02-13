"use client";

import { useState, useEffect } from "react";

interface FilterPriceRangeProps {
  minPrice: string;
  maxPrice: string;
  onApply: (min: string, max: string) => void;
}

export default function FilterPriceRange({
  minPrice,
  maxPrice,
  onApply,
}: FilterPriceRangeProps) {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);

  useEffect(() => {
    setMin(minPrice);
    setMax(maxPrice);
  }, [minPrice, maxPrice]);

  const handleApply = () => {
    onApply(min, max);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="Min"
            min="0"
            className="w-full rounded-lg border border-gray-border px-3 py-1.5 text-xs text-dark outline-none focus:border-primary"
          />
        </div>
        <span className="text-xs text-gray-text">-</span>
        <div className="flex-1">
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder="Max"
            min="0"
            className="w-full rounded-lg border border-gray-border px-3 py-1.5 text-xs text-dark outline-none focus:border-primary"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleApply}
        className="w-full rounded-lg bg-dark px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-dark/90"
      >
        Apply
      </button>
    </div>
  );
}
