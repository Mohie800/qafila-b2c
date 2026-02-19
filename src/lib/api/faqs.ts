import apiClient from "./client";
import type { FaqCategory, Faq } from "@/types/faq";

export async function getFaqCategories(
  isActive?: boolean,
): Promise<FaqCategory[]> {
  return apiClient.get("/faqs/categories", {
    params: isActive !== undefined ? { isActive } : undefined,
  });
}

export async function getFaqCategoryById(id: string): Promise<FaqCategory> {
  return apiClient.get(`/faqs/categories/${id}`);
}

export async function getFaqs(
  categoryId?: string,
  isActive?: boolean,
): Promise<Faq[]> {
  const params: Record<string, string | boolean> = {};
  if (categoryId) params.categoryId = categoryId;
  if (isActive !== undefined) params.isActive = isActive;
  return apiClient.get("/faqs", { params });
}

export async function getFaqById(id: string): Promise<Faq> {
  return apiClient.get(`/faqs/${id}`);
}
