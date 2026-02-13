import apiClient from "./client";
import type { PaginatedResponse } from "./types";
import type { PriceRange } from "@/types/filters";

export interface GetPriceRangesParams {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export async function getPriceRanges(
  params?: GetPriceRangesParams,
): Promise<PaginatedResponse<PriceRange>> {
  return apiClient.get("/price-ranges", { params });
}
