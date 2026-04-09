"use client";

interface FilterSaleToggleProps {
  label: string;
  isActive: boolean;
  onToggle: () => void;
}

export default function FilterSaleToggle({
  label,
  isActive,
  onToggle,
}: FilterSaleToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-1">
      <span className="text-xs font-medium text-dark dark:text-gray-200">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={isActive}
        onClick={onToggle}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          isActive ? "bg-primary" : "bg-gray-border dark:bg-gray-600"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[inset-inline-start] duration-200 ${
            isActive ? "start-[18px]" : "start-0.5"
          }`}
        />
      </button>
    </label>
  );
}
