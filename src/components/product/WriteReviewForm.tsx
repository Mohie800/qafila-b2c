"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Star, ImagePlus, Video, Mic, X } from "lucide-react";
import { createReviewWithMedia } from "@/lib/api/reviews";

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
  const [videos, setVideos] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [voiceNote, setVoiceNote] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ratingError, setRatingError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - images.length;
    const toAdd = files.slice(0, remaining);

    // Validate size (5MB per image)
    for (const file of toAdd) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t("imageTooLarge"));
        return;
      }
    }

    setImages((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [
      ...prev,
      ...toAdd.map((f) => URL.createObjectURL(f)),
    ]);
    setError("");

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageRemove = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 2 - videos.length;
    const toAdd = files.slice(0, remaining);

    // Validate size (50MB per video)
    for (const file of toAdd) {
      if (file.size > 50 * 1024 * 1024) {
        setError(t("videoTooLarge"));
        return;
      }
    }

    setVideos((prev) => [...prev, ...toAdd]);
    setVideoPreviews((prev) => [
      ...prev,
      ...toAdd.map((f) => URL.createObjectURL(f)),
    ]);
    setError("");

    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleVideoRemove = (index: number) => {
    URL.revokeObjectURL(videoPreviews[index]);
    setVideos((prev) => prev.filter((_, i) => i !== index));
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVoiceNoteAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError(t("voiceNoteTooLarge"));
      return;
    }

    setVoiceNote(file);
    setError("");

    if (voiceInputRef.current) voiceInputRef.current.value = "";
  };

  const handleVoiceNoteRemove = () => {
    setVoiceNote(null);
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
      videos.forEach((file) => formData.append("videos", file));
      if (voiceNote) formData.append("voiceNote", voiceNote);

      await createReviewWithMedia(formData);
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
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark p-5">
      <h3 className="mb-4 text-sm font-bold text-dark dark:text-gray-100">
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
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark px-3 py-2.5 text-sm text-dark dark:text-gray-200 outline-none transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-500 focus:border-primary"
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
          className="w-full resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark px-3 py-2.5 text-sm text-dark dark:text-gray-200 leading-relaxed outline-none transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-500 focus:border-primary"
        />
      </div>

      {/* Image upload */}
      <div className="mb-3">
        {previews.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div
                key={i}
                className="group relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
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
        {images.length < 5 && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-text transition-colors hover:text-dark"
            >
              <ImagePlus size={14} />
              {t("addImages")}
              <span className="text-gray-300">
                ({t("maxImages", { count: 5 })})
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

      {/* Video upload */}
      <div className="mb-3">
        {videoPreviews.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {videoPreviews.map((src, i) => (
              <div
                key={i}
                className="group relative h-16 w-24 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
              >
                <video
                  src={src}
                  className="h-full w-full object-cover"
                  muted
                />
                <button
                  type="button"
                  onClick={() => handleVideoRemove(i)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        {videos.length < 2 && (
          <>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-text transition-colors hover:text-dark"
            >
              <Video size={14} />
              {t("addVideos")}
              <span className="text-gray-300">
                ({t("maxVideos", { count: 2 })})
              </span>
            </button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              multiple
              onChange={handleVideoAdd}
              className="hidden"
            />
          </>
        )}
      </div>

      {/* Voice note upload */}
      <div className="mb-4">
        {voiceNote ? (
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark px-3 py-2">
            <Mic size={14} className="text-gray-text" />
            <span className="flex-1 truncate text-xs text-dark dark:text-gray-200">
              {voiceNote.name}
            </span>
            <button
              type="button"
              onClick={handleVoiceNoteRemove}
              className="text-gray-text transition-colors hover:text-dark"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => voiceInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-text transition-colors hover:text-dark"
            >
              <Mic size={14} />
              {t("addVoiceNote")}
            </button>
            <input
              ref={voiceInputRef}
              type="file"
              accept="audio/*"
              onChange={handleVoiceNoteAdd}
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
          className="rounded-lg border border-gray-200 dark:border-gray-700 px-6 py-2.5 text-sm font-medium text-gray-text transition-colors hover:bg-gray-50 dark:hover:bg-dark/80 disabled:opacity-50"
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
