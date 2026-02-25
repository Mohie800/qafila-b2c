"use client";

import { useState } from "react";
import {
  Star,
  ThumbsUp,
  BadgeCheck,
  MessageCircle,
  Pencil,
  Trash2,
  EllipsisVertical,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { getMediaUrl } from "@/lib/utils";
import {
  toggleReviewLike,
  updateReview,
  deleteReview,
} from "@/lib/api/reviews";
import { useAuth } from "@/lib/auth-context";
import ReviewComments from "./ReviewComments";

export interface ReviewMediaItem {
  id: string;
  url: string;
  alt: string | null;
  type: "IMAGE" | "VIDEO" | "VOICE_NOTE";
  duration?: number | null;
  thumbnailUrl?: string | null;
}

export interface ReviewData {
  id: string;
  userName: string;
  userAvatar: string | null;
  userId: string;
  rating: number;
  title: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  media: ReviewMediaItem[];
  helpfulCount: number;
  hasLiked: boolean;
  commentCount: number;
}

interface ReviewCardProps {
  review: ReviewData;
  onRequireLogin: () => void;
  onReviewChanged: () => void;
}

export default function ReviewCard({
  review,
  onRequireLogin,
  onReviewChanged,
}: ReviewCardProps) {
  const t = useTranslations("productDetail");
  const { user, isLoggedIn } = useAuth();

  const [liked, setLiked] = useState(review.hasLiked);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editTitle, setEditTitle] = useState(review.title || "");
  const [editContent, setEditContent] = useState(review.comment);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete
  const [deleting, setDeleting] = useState(false);

  const isOwner = isLoggedIn && user?.id === review.userId;

  const date = new Date(review.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const initials = review.userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLike = async () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await toggleReviewLike(review.id);
      setLiked(res.liked);
      setHelpfulCount(res.helpfulCount);
    } catch {
      // silently fail
    } finally {
      setLikeLoading(false);
    }
  };

  const handleStartEdit = () => {
    setEditing(true);
    setEditRating(review.rating);
    setEditTitle(review.title || "");
    setEditContent(review.comment);
    setEditError("");
    setMenuOpen(false);
  };

  const handleSaveEdit = async () => {
    if (editRating === 0) return;
    setEditSaving(true);
    setEditError("");
    try {
      await updateReview(review.id, {
        rating: editRating,
        title: editTitle.trim() || undefined,
        content: editContent.trim() || undefined,
      });
      setEditing(false);
      onReviewChanged();
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : t("reviewError"),
      );
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("deleteConfirm"))) return;
    setMenuOpen(false);
    setDeleting(true);
    try {
      await deleteReview(review.id);
      onReviewChanged();
    } catch {
      setDeleting(false);
    }
  };

  const handleCommentToggle = () => {
    setShowComments((prev) => !prev);
  };

  if (deleting) {
    return (
      <div className="border-b border-gray-100 py-5 text-center text-xs text-gray-text opacity-50">
        {t("reviewDeleted")}
      </div>
    );
  }

  return (
    <div className="border-b border-gray-100 py-5 last:border-b-0">
      {/* Header: avatar + name + date + owner menu */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            {review.userAvatar ? (
              <Image
                src={getMediaUrl(review.userAvatar) || review.userAvatar}
                alt={review.userName}
                fill
                className="object-cover"
                sizes="36px"
              />
            ) : (
              <span className="text-xs font-bold text-gray-text">
                {initials}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-dark">
                {review.userName}
              </p>
              {review.isVerifiedPurchase && (
                <span className="flex items-center gap-0.5 text-[10px] font-medium text-green">
                  <BadgeCheck size={12} />
                  {t("verified")}
                </span>
              )}
            </div>
            {/* Stars (read-only when not editing) */}
            {!editing && (
              <div className="mt-0.5 flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={10}
                    className={
                      i < review.rating
                        ? "fill-star text-star"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-text">{date}</span>

          {/* Owner menu */}
          {isOwner && !editing && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded p-1 text-gray-text transition-colors hover:bg-gray-50 hover:text-dark"
              >
                <EllipsisVertical size={14} />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute end-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    <button
                      onClick={handleStartEdit}
                      className="flex w-full items-center gap-2 px-3 py-2 text-start text-xs text-dark transition-colors hover:bg-gray-50"
                    >
                      <Pencil size={12} />
                      {t("editReview")}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 px-3 py-2 text-start text-xs text-discount transition-colors hover:bg-gray-50"
                    >
                      <Trash2 size={12} />
                      {t("deleteReview")}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="mt-3 ps-12">
        {editing ? (
          /* ── Edit mode ── */
          <div className="space-y-3">
            {/* Rating */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEditRating(star)}
                  onMouseEnter={() => setEditHoverRating(star)}
                  onMouseLeave={() => setEditHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={18}
                    className={
                      star <= (editHoverRating || editRating)
                        ? "fill-star text-star"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
            </div>

            {/* Title */}
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder={t("reviewTitlePlaceholder")}
              maxLength={200}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors placeholder:text-gray-300 focus:border-primary"
            />

            {/* Content */}
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder={t("reviewContentPlaceholder")}
              maxLength={5000}
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm leading-relaxed outline-none transition-colors placeholder:text-gray-300 focus:border-primary"
            />

            {editError && (
              <p className="text-xs text-discount">{editError}</p>
            )}

            {/* Edit actions */}
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={editSaving || editRating === 0}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {editSaving ? t("saving") : t("save")}
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={editSaving}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-text transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        ) : (
          /* ── Read mode ── */
          <>
            {review.title && (
              <p className="mb-1 text-sm font-semibold text-dark">
                {review.title}
              </p>
            )}
            <p className="text-sm leading-relaxed text-gray-text">
              {review.comment}
            </p>

            {/* Review media */}
            {review.media.length > 0 && (
              <div className="mt-3 space-y-2">
                {/* Images */}
                {review.media.filter((m) => m.type === "IMAGE").length > 0 && (
                  <div className="flex gap-2">
                    {review.media
                      .filter((m) => m.type === "IMAGE")
                      .map((img) => (
                        <div
                          key={img.id}
                          className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100"
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
                  </div>
                )}
                {/* Videos */}
                {review.media.filter((m) => m.type === "VIDEO").length > 0 && (
                  <div className="flex gap-2">
                    {review.media
                      .filter((m) => m.type === "VIDEO")
                      .map((vid) => (
                        <video
                          key={vid.id}
                          src={getMediaUrl(vid.url) || vid.url}
                          controls
                          className="h-24 w-36 rounded-lg bg-gray-100 object-cover"
                        />
                      ))}
                  </div>
                )}
                {/* Voice notes */}
                {review.media.filter((m) => m.type === "VOICE_NOTE").length >
                  0 && (
                  <div className="flex flex-col gap-1">
                    {review.media
                      .filter((m) => m.type === "VOICE_NOTE")
                      .map((voice) => (
                        <audio
                          key={voice.id}
                          src={getMediaUrl(voice.url) || voice.url}
                          controls
                          className="h-8 w-full max-w-xs"
                        />
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Action row: helpful + comments */}
            <div className="mt-3 flex items-center gap-4">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`flex items-center gap-1.5 transition-colors ${
                  liked ? "text-primary" : "text-gray-text hover:text-dark"
                } disabled:opacity-50`}
              >
                <ThumbsUp
                  size={14}
                  className={liked ? "fill-primary" : ""}
                />
                <span className="text-xs">
                  {t("helpful")}
                  {helpfulCount > 0 && ` (${helpfulCount})`}
                </span>
              </button>

              <button
                onClick={handleCommentToggle}
                className="flex items-center gap-1.5 text-gray-text transition-colors hover:text-dark"
              >
                <MessageCircle size={14} />
                <span className="text-xs">
                  {review.commentCount > 0
                    ? t("commentsCount", { count: review.commentCount })
                    : t("comments")}
                </span>
              </button>
            </div>

            {/* Comments section */}
            {showComments && (
              <ReviewComments
                reviewId={review.id}
                onRequireLogin={onRequireLogin}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
