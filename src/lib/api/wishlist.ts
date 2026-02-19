import apiClient from "./client";
import type {
  WishlistResponse,
  WishlistCountResponse,
  CheckWishlistResponse,
  AddToWishlistDto,
} from "@/types/wishlist";

export async function getWishlist(): Promise<WishlistResponse> {
  return apiClient.get("/wishlist");
}

export async function getWishlistCount(): Promise<WishlistCountResponse> {
  return apiClient.get("/wishlist/count");
}

export async function addToWishlist(
  dto: AddToWishlistDto,
): Promise<void> {
  return apiClient.post("/wishlist", dto);
}

export async function removeFromWishlist(productId: string): Promise<void> {
  return apiClient.delete(`/wishlist/${productId}`);
}

export async function clearWishlist(): Promise<void> {
  return apiClient.delete("/wishlist");
}

export async function checkInWishlist(
  productId: string,
): Promise<CheckWishlistResponse> {
  return apiClient.get(`/wishlist/check/${productId}`);
}
