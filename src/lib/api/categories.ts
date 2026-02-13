import apiClient from "./client";
import type { PaginatedResponse } from "./types";
import type { Category } from "@/types/category";

export interface GetCategoriesParams {
  rootOnly?: boolean;
  isActive?: boolean;
  includeChildren?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getCategories(
  params?: GetCategoriesParams,
): Promise<PaginatedResponse<Category>> {
  return apiClient.get("/categories", { params });
}

export async function getCategoryTree(
  activeOnly?: boolean,
): Promise<Category[]> {
  return apiClient.get("/categories/tree", {
    params: activeOnly != null ? { activeOnly } : undefined,
  });
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  return apiClient.get(`/categories/slug/${slug}`);
}

export async function getCategoryById(id: string): Promise<Category> {
  return apiClient.get(`/categories/${id}`);
}

export async function getSubcategories(
  id: string,
  activeOnly?: boolean,
): Promise<Category[]> {
  return apiClient.get(`/categories/${id}/subcategories`, {
    params: activeOnly != null ? { activeOnly } : undefined,
  });
}

export async function getCategoryBreadcrumb(id: string): Promise<Category[]> {
  return apiClient.get(`/categories/${id}/breadcrumb`);
}
