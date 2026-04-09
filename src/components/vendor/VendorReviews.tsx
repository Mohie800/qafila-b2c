"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getVendorReviews } from "@/lib/api/vendors";
import type { ApiReview } from "@/lib/api/reviews";
import type { PaginationMeta } from "@/lib/api/types";
import ReviewCard from "@/components/product/ReviewCard";
import type { ReviewData } from "@/components/product/ReviewCard";
import { getMediaUrl } from "@/lib/utils";

function mapApiReview(r: ApiReview): ReviewData {
  return {
    id: r.id,
    userName: `${r.user.firstName} ${r.user.lastName}`.trim(),
    userAvatar: null,
    userId: r.user.id,
    rating: r.rating,
    title: r.title,
    comment: r.content ?? "",
    isVerifiedPurchase: r.isVerifiedPurchase,
    createdAt: r.createdAt,
    media: (r.media || []).map((m) => ({
      id: m.id,
      url: getMediaUrl(m.url) || m.url,
      alt: m.alt,
      type: m.type || "IMAGE",
      duration: m.duration,
      thumbnailUrl: m.thumbnailUrl,
    })),
    helpfulCount: r.helpfulCount,
    hasLiked: r.hasLiked,
    commentCount: r.commentCount,
  };
}

interface VendorReviewsProps {
  vendorId: string;
  initialReviews: ApiReview[];
  initialPagination: PaginationMeta;
  onRequireLogin: () => void;
}

export default function VendorReviews({
  vendorId,
  initialReviews,
  initialPagination,
  onRequireLogin,
}: VendorReviewsProps) {
  const t = useTranslations("vendor");

  const [reviews, setReviews] = useState<ApiReview[]>(initialReviews);
  const [pagination, setPagination] =
    useState<PaginationMeta>(initialPagination);
  const [loading, setLoading] = useState(false);

  const fetchReviews = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const res = await getVendorReviews(vendorId, { page, limit: 10 });
        if (page === 1) {
          setReviews(res.data);
        } else {
          setReviews((prev) => [...prev, ...res.data]);
        }
        setPagination(res.meta);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    },
    [vendorId],
  );

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchReviews(pagination.page + 1);
    }
  };

  const handleReviewChanged = () => {
    fetchReviews(1);
  };

  if (reviews.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-medium text-dark">{t("noReviews")}</p>
        <p className="mt-1 text-xs text-gray-text">
          {t("noReviewsDescription")}
        </p>
      </div>
    );
  }

  return (
    <div>
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={mapApiReview(review)}
          onRequireLogin={onRequireLogin}
          onReviewChanged={handleReviewChanged}
        />
      ))}

      {pagination.page < pagination.totalPages && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="rounded-lg border border-gray-border dark:border-gray-700 px-6 py-2 text-sm font-medium text-dark dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-dark/80 disabled:opacity-50"
          >
            {loading ? "..." : t("loadMore")}
          </button>
        </div>
      )}
    </div>
  );
}
