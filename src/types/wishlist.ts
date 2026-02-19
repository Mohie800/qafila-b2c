export interface WishlistItemDto {
  id: string;
  productId: string;
  productTitle: string;
  productTitleAr: string | null;
  productDescription: string | null;
  productDescriptionAr: string | null;
  productCategory: string | null;
  productBrand: string | null;
  productPrice: number;
  productSalePrice: number | null;
  discountPercentage: number | null;
  productImage: string | null;
  productSlug: string;
  averageRating?: number;
  reviewCount?: number;
  inStock: boolean;
  addedAt: string;
}

export interface WishlistResponse {
  items: WishlistItemDto[];
  total: number;
}

export interface WishlistCountResponse {
  count: number;
}

export interface CheckWishlistResponse {
  inWishlist: boolean;
}

export interface AddToWishlistDto {
  productId: string;
}
