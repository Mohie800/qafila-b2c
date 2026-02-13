import apiClient from "./client";
import type { RecommendationResponse } from "@/types/product";

export interface RecommendationParams {
  limit?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function getForYou(
  params?: RecommendationParams,
): Promise<RecommendationResponse> {
  return apiClient.get("/recommendations/for-you", { params });
}

export async function getBestSellers(
  params?: RecommendationParams,
): Promise<RecommendationResponse> {
  return apiClient.get("/recommendations/best-sellers", { params });
}
