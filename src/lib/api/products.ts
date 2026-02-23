import apiClient from "./client";
import type { PaginatedResponse } from "./types";

export interface ApiProductColor {
  id: string;
  productId: string;
  colorId: string;
  isDefault: boolean;
  color: {
    id: string;
    name: string;
    nameAr: string;
    hexCode: string | null;
  };
}

export interface ApiProductSize {
  id: string;
  productId: string;
  sizeId: string;
  size: {
    id: string;
    name: string;
    nameAr: string;
    sortOrder: number;
  };
}

export interface ApiProductVariant {
  id: string;
  productId: string;
  productColorId: string;
  productSizeId: string;
  sku: string | null;
  price: string | null;
  salePrice: string | null;
  quantity: number;
  isActive: boolean;
  productColor: ApiProductColor;
  productSize: ApiProductSize;
}

export interface ApiProductImage {
  id: string;
  productId: string;
  productColorId: string | null;
  url: string;
  alt: string | null;
  sortOrder: number;
  isDefault: boolean;
}

export interface ApiProduct {
  id: string;
  title: string;
  titleAr: string;
  slug: string;
  description: string | null;
  descriptionAr: string | null;
  price: string;
  salePrice: string | null;
  sku: string | null;
  quantity: number;
  lowStockAlert: number;
  averageRating: string;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    nameAr: string;
    slug: string;
  } | null;
  brand: {
    id: string;
    name: string;
    nameAr: string;
    slug: string;
  } | null;
  material: {
    id: string;
    name: string;
    nameAr: string;
  } | null;
  condition: {
    id: string;
    name: string;
    nameAr: string;
    type: string;
  } | null;
  pattern: {
    id: string;
    name: string;
    nameAr: string;
  } | null;
  vendor: {
    id: string;
    storeName: string;
    storeNameAr: string;
    slug: string;
  } | null;
  colors: ApiProductColor[];
  sizes: ApiProductSize[];
  variants: ApiProductVariant[];
  images: ApiProductImage[];
}

export interface GetProductsParams {
  categoryId?: string;
  vendorId?: string;
  brandId?: string;
  colorId?: string;
  sizeId?: string;
  materialId?: string;
  patternId?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getProducts(
  params?: GetProductsParams,
): Promise<PaginatedResponse<ApiProduct>> {
  return apiClient.get("/products", { params });
}

export async function getProductById(id: string): Promise<ApiProduct> {
  return apiClient.get(`/products/${id}`);
}

export async function getProductBySlug(slug: string): Promise<ApiProduct> {
  return apiClient.get(`/products/slug/${slug}`);
}
