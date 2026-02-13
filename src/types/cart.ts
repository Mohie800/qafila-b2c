export interface CartItemVariantDetails {
  color?: string | { id: string; name: string; nameAr: string };
  size?: string | { id: string; name: string; nameAr: string };
  sku?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productTitle: string;
  productTitleAr: string;
  productSlug: string;
  productImage: string | null;
  variantId: string | null;
  variantDetails: CartItemVariantDetails | null;
  quantity: number;
  unitPrice: number;
  salePrice: number | null;
  snapshotPrice: number;
  priceChanged: boolean;
  discountPercentage: number;
  lineTotal: number;
  availableStock: number;
  inStock: boolean;
  exceedsStock: boolean;
  addedAt: string;
}

export interface CartSummary {
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  discount: number;
  total: number;
  taxRate: number;
  taxAmount: number;
  totalBeforeTax: number;
  hasPriceChanges: boolean;
  hasOutOfStockItems: boolean;
  hasStockIssues: boolean;
}

export interface CartResponse {
  id: string;
  guestId: string | null;
  items: CartItem[];
  summary: CartSummary;
  updatedAt: string;
}

export interface CartCountResponse {
  count: number;
  totalQuantity: number;
}

export interface GuestCartCreatedResponse {
  guestId: string;
  cartId: string;
  expiresAt: string;
}

export interface AddToCartDto {
  productId: string;
  variantId?: string;
  quantity?: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}
