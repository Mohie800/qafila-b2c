import apiClient from "./client";
import type { PaginatedResponse } from "./types";
import type { Brand } from "@/types/filters";

export interface GetBrandsParams {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getBrands(
  params?: GetBrandsParams,
): Promise<PaginatedResponse<Brand>> {
  return apiClient.get("/brands", { params });
}
