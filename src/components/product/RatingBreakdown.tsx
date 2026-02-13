"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

interface RatingBreakdownProps {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

export default function RatingBreakdown({
  averageRating,
  totalReviews,
  distribution,
}: RatingBreakdownProps) {
  const t = useTranslations("productDetail");

  return (
    <div className="space-y-4">
      {/* Average rating */}
      <div>
        <span className="text-4xl font-bold text-dark">
          {Number(averageRating).toFixed(1)}
        </span>
        <div className="mt-1 flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={
                i < Math.round(Number(averageRating))
                  ? "fill-star text-star"
                  : "text-gray-300"
              }
            />
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-text">
          {totalReviews} {t("rating")}
        </p>
      </div>

      {/* Distribution bars */}
      <div className="space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] || 0;
          const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="w-3 text-xs font-medium text-gray-text">
                {star}
              </span>
              <Star size={10} className="fill-star text-star" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-star transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-6 text-end text-[10px] text-gray-text">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
