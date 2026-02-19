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
import type { WishlistItemDto } from "@/types/wishlist";
import * as wishlistApi from "./api/wishlist";

interface WishlistContextValue {
  items: WishlistItemDto[];
  itemCount: number;
  loading: boolean;
  /** Check if a product is in the wishlist (client-side, from loaded items) */
  isInWishlist: (productId: string) => boolean;
  /** Toggle a product in/out of the wishlist. Returns the new state (true = added). */
  toggleWishlist: (productId: string) => Promise<boolean>;
  /** Remove a product from the wishlist */
  removeFromWishlist: (productId: string) => Promise<void>;
  /** Clear entire wishlist */
  clearWishlist: () => Promise<void>;
  /** Refresh the wishlist from the server */
  refreshWishlist: () => Promise<void>;
}

const emptyCtx: WishlistContextValue = {
  items: [],
  itemCount: 0,
  loading: false,
  isInWishlist: () => false,
  toggleWishlist: async () => false,
  removeFromWishlist: async () => {},
  clearWishlist: async () => {},
  refreshWishlist: async () => {},
};

const WishlistContext = createContext<WishlistContextValue>(emptyCtx);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState<WishlistItemDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Maintain a Set of product IDs for O(1) lookup
  const [productIds, setProductIds] = useState<Set<string>>(new Set());

  const itemCount = items.length;

  const syncProductIds = useCallback((wishlistItems: WishlistItemDto[]) => {
    setProductIds(new Set(wishlistItems.map((i) => i.productId)));
  }, []);

  const refreshWishlist = useCallback(async () => {
    if (!isLoggedIn) {
      setItems([]);
      setProductIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const data = await wishlistApi.getWishlist();
      setItems(data.items);
      syncProductIds(data.items);
    } catch {
      setItems([]);
      setProductIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, syncProductIds]);

  // Fetch wishlist on mount and when auth changes
  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isInWishlist = useCallback(
    (productId: string) => productIds.has(productId),
    [productIds],
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!isLoggedIn) return false;

      if (productIds.has(productId)) {
        // Remove
        // Optimistic update
        setItems((prev) => prev.filter((i) => i.productId !== productId));
        setProductIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        try {
          await wishlistApi.removeFromWishlist(productId);
        } catch {
          // Revert on failure
          await refreshWishlist();
        }
        return false;
      } else {
        // Add
        // Optimistic: add productId to set immediately
        setProductIds((prev) => new Set(prev).add(productId));
        try {
          await wishlistApi.addToWishlist({ productId });
          // Refresh to get full item data
          await refreshWishlist();
        } catch {
          // Revert on failure
          setProductIds((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
        }
        return true;
      }
    },
    [isLoggedIn, productIds, refreshWishlist],
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      // Optimistic update
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      setProductIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      try {
        await wishlistApi.removeFromWishlist(productId);
      } catch {
        await refreshWishlist();
      }
    },
    [refreshWishlist],
  );

  const clearWishlist = useCallback(async () => {
    setItems([]);
    setProductIds(new Set());
    try {
      await wishlistApi.clearWishlist();
    } catch {
      await refreshWishlist();
    }
  }, [refreshWishlist]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
