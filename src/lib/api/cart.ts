import apiClient from "./client";
import type {
  CartResponse,
  CartCountResponse,
  GuestCartCreatedResponse,
  AddToCartDto,
  UpdateCartItemDto,
} from "@/types/cart";

// --- Guest cart ---

export async function createGuestCart(): Promise<GuestCartCreatedResponse> {
  return apiClient.post("/cart/guest");
}

export async function getGuestCart(guestId: string): Promise<CartResponse> {
  return apiClient.get(`/cart/guest/${guestId}`);
}

export async function getGuestCartCount(
  guestId: string,
): Promise<CartCountResponse> {
  return apiClient.get(`/cart/guest/${guestId}/count`);
}

export async function addGuestCartItem(
  guestId: string,
  dto: AddToCartDto,
): Promise<CartResponse> {
  return apiClient.post(`/cart/guest/${guestId}/items`, dto);
}

export async function updateGuestCartItem(
  guestId: string,
  itemId: string,
  dto: UpdateCartItemDto,
): Promise<CartResponse> {
  return apiClient.patch(`/cart/guest/${guestId}/items/${itemId}`, dto);
}

export async function removeGuestCartItem(
  guestId: string,
  itemId: string,
): Promise<CartResponse> {
  return apiClient.delete(`/cart/guest/${guestId}/items/${itemId}`);
}

export async function clearGuestCart(guestId: string): Promise<void> {
  return apiClient.delete(`/cart/guest/${guestId}`);
}

// --- Authenticated cart ---

export async function getUserCart(): Promise<CartResponse> {
  return apiClient.get("/cart");
}

export async function getUserCartCount(): Promise<CartCountResponse> {
  return apiClient.get("/cart/count");
}

export async function addUserCartItem(
  dto: AddToCartDto,
): Promise<CartResponse> {
  return apiClient.post("/cart/items", dto);
}

export async function updateUserCartItem(
  itemId: string,
  dto: UpdateCartItemDto,
): Promise<CartResponse> {
  return apiClient.patch(`/cart/items/${itemId}`, dto);
}

export async function removeUserCartItem(
  itemId: string,
): Promise<CartResponse> {
  return apiClient.delete(`/cart/items/${itemId}`);
}

export async function clearUserCart(): Promise<void> {
  return apiClient.delete("/cart");
}

export async function mergeGuestCart(guestId: string): Promise<CartResponse> {
  return apiClient.post("/cart/merge", { guestId });
}
