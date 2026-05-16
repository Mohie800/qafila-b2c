import apiClient from "./client";

export type BannerLinkType = "NONE" | "PRODUCT" | "CATEGORY" | "EXTERNAL";

export interface Banner {
  id: string;
  name: string;
  nameAr?: string | null;
  image: string;
  imageAr?: string | null;
  linkType: BannerLinkType;
  linkId?: string | null;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getActiveBanners(): Promise<Banner[]> {
  return apiClient.get("/banners/active");
}
