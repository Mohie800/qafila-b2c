import apiClient from "./client";
import type { PaginatedResponse } from "./types";
import type { Color } from "@/types/filters";

export interface GetColorsParams {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getColors(
  params?: GetColorsParams,
): Promise<PaginatedResponse<Color>> {
  return apiClient.get("/colors", { params });
}
