import apiClient from "./client";
import type { PaginatedResponse } from "./types";
import type { Material } from "@/types/filters";

export interface GetMaterialsParams {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getMaterials(
  params?: GetMaterialsParams,
): Promise<PaginatedResponse<Material>> {
  return apiClient.get("/materials", { params });
}
