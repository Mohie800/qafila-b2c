import apiClient from "./client";
import type { PaginatedResponse } from "./types";
import type { Size } from "@/types/filters";

export interface GetSizesParams {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getSizes(
  params?: GetSizesParams,
): Promise<PaginatedResponse<Size>> {
  return apiClient.get("/sizes", { params });
}
