import apiClient from "./client";
import type { PaginatedResponse } from "./types";

// ── Response types (match backend docs) ──

export interface ReviewUser {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ReviewMedia {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  type: "IMAGE" | "VIDEO" | "VOICE_NOTE";
  duration: number | null;
  thumbnailUrl: string | null;
}

/** @deprecated Use ReviewMedia instead */
export type ReviewImage = ReviewMedia;

export interface ApiReview {
  id: string;
  productId: string;
  rating: number;
  title: string | null;
  content: string | null;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  hasLiked: boolean;
  user: ReviewUser;
  media: ReviewMedia[];
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  verifiedPurchasePercentage: number;
  reviewsWithMedia: number;
}

export interface ReviewComment {
  id: string;
  reviewId: string;
  content: string;
  user: ReviewUser;
  replies: {
    id: string;
    content: string;
    user: ReviewUser;
    createdAt: string;
    updatedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// ── Query params ──

export interface GetReviewsParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "rating" | "helpfulCount";
  sortOrder?: "asc" | "desc";
  minRating?: number;
  maxRating?: number;
  verifiedOnly?: boolean;
  withMediaOnly?: boolean;
}

// ── Public endpoints (no auth) ──

export async function getProductReviews(
  productId: string,
  params?: GetReviewsParams,
): Promise<PaginatedResponse<ApiReview>> {
  return apiClient.get(`/reviews/product/${productId}`, { params });
}

export async function getReviewStats(
  productId: string,
): Promise<ReviewStats> {
  return apiClient.get(`/reviews/product/${productId}/stats`);
}

export async function getReviewById(id: string): Promise<ApiReview> {
  return apiClient.get(`/reviews/${id}`);
}

export async function getReviewComments(
  reviewId: string,
  params?: { page?: number; limit?: number },
): Promise<PaginatedResponse<ReviewComment>> {
  return apiClient.get(`/reviews/${reviewId}/comments`, { params });
}

// ── Authenticated endpoints ──

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  title?: string;
  content?: string;
  media?: { url: string; alt?: string; sortOrder?: number; type?: string }[];
}

export interface UpdateReviewPayload {
  rating?: number;
  title?: string;
  content?: string;
  media?: { url: string; alt?: string; sortOrder?: number; type?: string }[];
}

export async function createReview(
  payload: CreateReviewPayload,
): Promise<ApiReview> {
  return apiClient.post("/reviews", payload);
}

export async function createReviewWithMedia(
  formData: FormData,
): Promise<ApiReview> {
  return apiClient.post("/reviews/with-media", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function createReviewWithImages(
  formData: FormData,
): Promise<ApiReview> {
  return apiClient.post("/reviews/with-images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function updateReview(
  id: string,
  payload: UpdateReviewPayload,
): Promise<ApiReview> {
  return apiClient.put(`/reviews/${id}`, payload);
}

export async function deleteReview(id: string): Promise<void> {
  return apiClient.delete(`/reviews/${id}`);
}

export async function getMyReviews(): Promise<PaginatedResponse<ApiReview>> {
  return apiClient.get("/reviews/user/my-reviews");
}

// ── Likes ──

export interface LikeResponse {
  liked: boolean;
  helpfulCount: number;
}

export async function toggleReviewLike(
  reviewId: string,
): Promise<LikeResponse> {
  return apiClient.post(`/reviews/${reviewId}/like`);
}

export async function getReviewLikeStatus(
  reviewId: string,
): Promise<{ liked: boolean }> {
  return apiClient.get(`/reviews/${reviewId}/like/status`);
}

// ── Comments ──

export async function createReviewComment(
  reviewId: string,
  payload: { content: string; parentId?: string },
): Promise<ReviewComment> {
  return apiClient.post(`/reviews/${reviewId}/comments`, payload);
}

export async function updateReviewComment(
  commentId: string,
  payload: { content: string },
): Promise<ReviewComment> {
  return apiClient.put(`/reviews/comments/${commentId}`, payload);
}

export async function deleteReviewComment(commentId: string): Promise<void> {
  return apiClient.delete(`/reviews/comments/${commentId}`);
}

// ── Media ──

export async function addReviewMedia(
  reviewId: string,
  formData: FormData,
): Promise<ReviewMedia> {
  return apiClient.post(`/reviews/${reviewId}/media`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function deleteReviewMedia(mediaId: string): Promise<void> {
  return apiClient.delete(`/reviews/media/${mediaId}`);
}

/** @deprecated Use addReviewMedia instead */
export const addReviewImage = addReviewMedia;

/** @deprecated Use deleteReviewMedia instead */
export const deleteReviewImage = deleteReviewMedia;
