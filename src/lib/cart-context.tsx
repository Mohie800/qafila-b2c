"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import type {
  CartResponse,
  CartItem,
  CartSummary,
  AddToCartDto,
} from "@/types/cart";
import * as cartApi from "./api/cart";

const GUEST_ID_KEY = "qafila_guest_id";

interface CartContextValue {
  cart: CartResponse | null;
  items: CartItem[];
  summary: CartSummary | null;
  itemCount: number;
  loading: boolean;
  addItem: (dto: AddToCartDto) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const emptyCtx: CartContextValue = {
  cart: null,
  items: [],
  summary: null,
  itemCount: 0,
  loading: false,
  addItem: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  refreshCart: async () => {},
};

const CartContext = createContext<CartContextValue>(emptyCtx);

function getGuestId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_ID_KEY);
}

function setGuestId(id: string) {
  localStorage.setItem(GUEST_ID_KEY, id);
}

function clearGuestId() {
  localStorage.removeItem(GUEST_ID_KEY);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const items = cart?.items ?? [];
  const summary = cart?.summary ?? null;
  const itemCount = summary?.totalQuantity ?? 0;

  // Fetch cart on mount and when auth changes
  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      if (isLoggedIn) {
        const data = await cartApi.getUserCart();
        setCart(data);
      } else {
        const guestId = getGuestId();
        if (guestId) {
          try {
            const data = await cartApi.getGuestCart(guestId);
            setCart(data);
          } catch {
            // Guest cart expired or invalid
            clearGuestId();
            setCart(null);
          }
        } else {
          setCart(null);
        }
      }
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Merge guest cart when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      const guestId = getGuestId();
      if (guestId) {
        cartApi
          .mergeGuestCart(guestId)
          .then((merged) => {
            setCart(merged);
            clearGuestId();
          })
          .catch(() => {
            clearGuestId();
          });
      }
    }
  }, [isLoggedIn]);

  const ensureGuestId = useCallback(async (): Promise<string> => {
    let guestId = getGuestId();
    if (!guestId) {
      const result = await cartApi.createGuestCart();
      guestId = result.guestId;
      setGuestId(guestId);
    }
    return guestId;
  }, []);

  const addItem = useCallback(
    async (dto: AddToCartDto) => {
      if (isLoggedIn) {
        const data = await cartApi.addUserCartItem(dto);
        setCart(data);
      } else {
        const guestId = await ensureGuestId();
        const data = await cartApi.addGuestCartItem(guestId, dto);
        setCart(data);
      }
    },
    [isLoggedIn, ensureGuestId],
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (isLoggedIn) {
        const data = await cartApi.updateUserCartItem(itemId, { quantity });
        setCart(data);
      } else {
        const guestId = getGuestId();
        if (!guestId) return;
        const data = await cartApi.updateGuestCartItem(guestId, itemId, {
          quantity,
        });
        setCart(data);
      }
    },
    [isLoggedIn],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (isLoggedIn) {
        const data = await cartApi.removeUserCartItem(itemId);
        setCart(data);
      } else {
        const guestId = getGuestId();
        if (!guestId) return;
        const data = await cartApi.removeGuestCartItem(guestId, itemId);
        setCart(data);
      }
    },
    [isLoggedIn],
  );

  const clearCart = useCallback(async () => {
    if (isLoggedIn) {
      await cartApi.clearUserCart();
    } else {
      const guestId = getGuestId();
      if (guestId) {
        await cartApi.clearGuestCart(guestId);
        clearGuestId();
      }
    }
    setCart(null);
  }, [isLoggedIn]);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        summary,
        itemCount,
        loading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
