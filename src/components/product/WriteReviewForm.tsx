"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Star, ImagePlus, X } from "lucide-react";
import { createReviewWithImages } from "@/lib/api/reviews";

interface WriteReviewFormProps {
  productId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function WriteReviewForm({
  productId,
  onSuccess,
  onCancel,
}: WriteReviewFormProps) {
  const t = useTranslations("productDetail");

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ratingError, setRatingError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - images.length;
    const toAdd = files.slice(0, remaining);

    setImages((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [
      ...prev,
      ...toAdd.map((f) => URL.createObjectURL(f)),
    ]);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageRemove = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setRatingError(true);
      return;
    }
    setRatingError(false);
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("rating", String(rating));
      if (title.trim()) formData.append("title", title.trim());
      if (content.trim()) formData.append("content", content.trim());
      images.forEach((file) => formData.append("images", file));

      await createReviewWithImages(formData);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("reviewError"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-bold text-dark">
        {t("writeReview")}
      </h3>

      {/* Star rating */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-gray-text">
          {t("yourRating")}
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => {
                setRating(star);
                setRatingError(false);
              }}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={24}
                className={
                  star <= (hoverRating || rating)
                    ? "fill-star text-star"
                    : "text-gray-300"
                }
              />
            </button>
          ))}
        </div>
        {ratingError && (
          <p className="mt-1 text-xs text-discount">{t("ratingRequired")}</p>
        )}
      </div>

      {/* Title */}
      <div className="mb-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("reviewTitlePlaceholder")}
          maxLength={200}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-300 focus:border-primary"
        />
      </div>

      {/* Content */}
      <div className="mb-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("reviewContentPlaceholder")}
          maxLength={5000}
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors placeholder:text-gray-300 focus:border-primary"
        />
      </div>

      {/* Image upload */}
      <div className="mb-4">
        {previews.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div
                key={i}
                className="group relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100"
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleImageRemove(i)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        {images.length < 10 && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-text transition-colors hover:text-dark"
            >
              <ImagePlus size={14} />
              {t("addImages")}
              <span className="text-gray-300">
                ({t("maxImages", { count: 10 })})
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageAdd}
              className="hidden"
            />
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="mb-3 text-xs text-discount">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? t("submitting") : t("submitReview")}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-text transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
