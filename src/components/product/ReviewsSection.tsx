"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, ChevronDown, Pen } from "lucide-react";
import Image from "next/image";
import { getMediaUrl } from "@/lib/utils";
import RatingBreakdown from "./RatingBreakdown";
import ReviewCard from "./ReviewCard";
import type { ReviewData, ReviewMediaItem } from "./ReviewCard";
import WriteReviewForm from "./WriteReviewForm";
import { useAuth } from "@/lib/auth-context";

interface ReviewsSectionProps {
  productId: string;
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
  reviews: ReviewData[];
  hasMore: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
  onSortChange: (sortBy: string) => void;
  onReviewSubmitted: () => void;
  onRequireLogin: () => void;
}

const SORT_OPTIONS = [
  "mostRelevant",
  "newest",
  "highest",
  "lowest",
] as const;

export default function ReviewsSection({
  productId,
  averageRating,
  totalReviews,
  distribution,
  reviews,
  hasMore,
  onLoadMore,
  loadingMore,
  onSortChange,
  onReviewSubmitted,
  onRequireLogin,
}: ReviewsSectionProps) {
  const t = useTranslations("productDetail");
  const { isLoggedIn } = useAuth();
  const [activeSort, setActiveSort] = useState<string>("mostRelevant");
  const [sortOpen, setSortOpen] = useState(false);
  const [showWriteForm, setShowWriteForm] = useState(false);

  // Collect all review media for the "Review Media" gallery section
  const allReviewImages = reviews.flatMap((r) =>
    r.media
      .filter((m) => m.type === "IMAGE")
      .map((img) => ({ ...img, reviewId: r.id })),
  );
  const allReviewVideos = reviews.flatMap((r) =>
    r.media
      .filter((m) => m.type === "VIDEO")
      .map((vid) => ({ ...vid, reviewId: r.id })),
  );

  const handleSortSelect = (key: string) => {
    setActiveSort(key);
    setSortOpen(false);
    onSortChange(key);
  };

  const handleWriteReviewClick = () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    setShowWriteForm(true);
  };

  const handleReviewSuccess = () => {
    setShowWriteForm(false);
    onReviewSubmitted();
  };

  return (
    <section className="mt-12">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-dark">
          {t("ratingsAndReviews")}{" "}
          <span className="text-sm font-normal text-gray-text">
            ({totalReviews})
          </span>
        </h2>

        <div className="flex items-center gap-3">
          {/* Write review button */}
          <button
            onClick={handleWriteReviewClick}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-hover"
          >
            <Pen size={12} />
            {t("writeReview")}
          </button>

          {/* Sort dropdown */}
          {reviews.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-dark transition-colors hover:bg-gray-50"
              >
                <SlidersHorizontal size={14} />
                {t(activeSort)}
                <ChevronDown
                  size={12}
                  className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
                />
              </button>
              {sortOpen && (
                <div className="absolute end-0 top-full z-10 mt-1 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  {SORT_OPTIONS.map((key) => (
                    <button
                      key={key}
                      onClick={() => handleSortSelect(key)}
                      className={`w-full px-4 py-2 text-start text-xs transition-colors hover:bg-gray-50 ${
                        activeSort === key
                          ? "font-semibold text-dark"
                          : "text-gray-text"
                      }`}
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Write review form */}
      {showWriteForm && (
        <div className="mt-6">
          <WriteReviewForm
            productId={productId}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowWriteForm(false)}
          />
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          {/* Left — Rating Breakdown */}
          <RatingBreakdown
            averageRating={averageRating}
            totalReviews={totalReviews}
            distribution={distribution}
          />

          {/* Right — Reviews */}
          <div>
            {/* Review Media Gallery */}
            {(allReviewImages.length > 0 || allReviewVideos.length > 0) && (
              <div className="mb-6">
                <p className="mb-3 text-sm font-semibold text-dark">
                  {t("reviewWithMedia")}{" "}
                  <span className="font-normal text-gray-text">
                    ({allReviewImages.length + allReviewVideos.length})
                  </span>
                </p>
                <div className="scrollbar-hide flex gap-2 overflow-x-auto">
                  {allReviewImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
                    >
                      <Image
                        src={getMediaUrl(img.url) || img.url}
                        alt={img.alt || "Review image"}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ))}
                  {allReviewVideos.map((vid) => (
                    <div
                      key={vid.id}
                      className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
                    >
                      <video
                        src={getMediaUrl(vid.url) || vid.url}
                        className="h-full w-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80">
                          <div className="ms-0.5 h-0 w-0 border-y-[5px] border-s-[8px] border-y-transparent border-s-dark" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review cards */}
            <div>
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onRequireLogin={onRequireLogin}
                  onReviewChanged={onReviewSubmitted}
                />
              ))}
            </div>

            {hasMore && (
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="mt-4 w-full rounded-lg border border-gray-border py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                {loadingMore ? "..." : t("showMore")}
              </button>
            )}
          </div>
        </div>
      ) : (
        !showWriteForm && (
          <div className="mt-8 text-center">
            <p className="text-sm font-semibold text-dark">{t("noReviews")}</p>
            <p className="mt-1 text-xs text-gray-text">
              {t("noReviewsDescription")}
            </p>
            <button
              onClick={handleWriteReviewClick}
              className="mt-4 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              {t("writeReview")}
            </button>
          </div>
        )
      )}
    </section>
  );
}
