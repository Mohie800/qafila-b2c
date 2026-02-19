"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Heart, ShoppingBag, Star, Trash2, X } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import SarIcon from "@/components/shared/SarIcon";
import Image from "next/image";
import { getMediaUrl } from "@/lib/utils";
import { useState } from "react";
import type { WishlistItemDto } from "@/types/wishlist";

export default function WishlistPage() {
  const t = useTranslations("wishlist");
  const locale = useLocale();
  const { items, loading, removeFromWishlist, clearWishlist, itemCount } =
    useWishlist();
  const { addItem } = useCart();
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const handleAddToCart = async (item: WishlistItemDto) => {
    if (addingToCart) return;
    setAddingToCart(item.productId);
    try {
      await addItem({ productId: item.productId, quantity: 1 });
    } catch {
      // handled by cart context
    } finally {
      setAddingToCart(null);
    }
  };

  const handleClear = async () => {
    await clearWishlist();
    setClearConfirmOpen(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-text">{t("subtitle")}</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => setClearConfirmOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-border px-3 py-2 text-xs font-medium text-gray-text transition-colors hover:border-discount hover:text-discount"
          >
            <Trash2 size={14} />
            {t("clearAll")}
          </button>
        )}
      </div>

      {/* Clear confirm dialog */}
      {clearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-dark">
                {t("clearConfirmTitle")}
              </h3>
              <button onClick={() => setClearConfirmOpen(false)}>
                <X size={18} className="text-gray-text" />
              </button>
            </div>
            <p className="mb-6 text-sm text-gray-text">
              {t("clearConfirmDesc")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setClearConfirmOpen(false)}
                className="flex-1 rounded-lg border border-gray-border py-2.5 text-sm font-medium text-dark transition-colors hover:bg-gray-50"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleClear}
                className="flex-1 rounded-lg bg-discount py-2.5 text-sm font-medium text-white transition-colors hover:bg-discount/90"
              >
                {t("clearAll")}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-border border-t-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart size={48} className="mb-4 text-gray-border" />
          <h2 className="mb-2 text-lg font-semibold text-dark">{t("empty")}</h2>
          <p className="mb-6 max-w-sm text-sm text-gray-text">
            {t("emptyDescription")}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <ShoppingBag size={16} />
            {t("shopNow")}
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-text">
            {t("itemsCount", { count: itemCount })}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => {
              const title =
                locale === "ar" && item.productTitleAr
                  ? item.productTitleAr
                  : item.productTitle;
              const hasSale =
                item.productSalePrice != null &&
                item.discountPercentage != null;

              return (
                <div
                  key={item.id}
                  className="group relative rounded-lg border border-gray-200 bg-white"
                >
                  {/* Remove button */}
                  <button
                    onClick={() => removeFromWishlist(item.productId)}
                    className="absolute end-2 top-2 z-10 flex h-7 w-7 items-center justify-center  transition-colors "
                    aria-label={t("remove")}
                  >
                    <Trash2
                      size={24}
                      className="text-gray-text group-hover:text-discount"
                    />
                  </button>

                  {/* Discount badge */}
                  {/* {hasSale && (
                    <span className="absolute start-2 top-2 z-10 rounded bg-discount px-2 py-0.5 text-[10px] font-bold text-white">
                      -{item.discountPercentage}%
                    </span>
                  )} */}

                  {/* Image */}
                  <Link href={`/products/${item.productSlug}`}>
                    <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-gray-100 border-b border-gray-200">
                      {item.productImage ? (
                        <Image
                          src={
                            getMediaUrl(item.productImage) || item.productImage
                          }
                          alt={title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-300">
                          Product Image
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="space-y-1.5 p-3">
                    <Link href={`/products/${item.productSlug}`}>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-dark line-clamp-2">
                        {title}
                      </h3>
                    </Link>

                    {item.productBrand && (
                      <p className="text-[12px] text-gray-text">
                        {item.productBrand}
                      </p>
                    )}

                    {/* Rating */}
                    {item.averageRating != null &&
                      item.averageRating != undefined &&
                      item.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold">
                            {item.averageRating}
                          </span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={10}
                                className={
                                  i < Math.floor(item.averageRating!!)
                                    ? "fill-star text-star"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-text">
                            ({item.reviewCount})
                          </span>
                        </div>
                      )}

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-dark" dir="ltr">
                        <SarIcon />{" "}
                        {Number(
                          hasSale ? item.productSalePrice : item.productPrice,
                        ).toFixed(2)}
                      </span>
                      {hasSale && (
                        <>
                          <span
                            className="text-sm text-gray-text line-through"
                            dir="ltr"
                          >
                            {Number(item.productPrice).toFixed(2)}
                          </span>
                          <span className="text-sm font-semibold text-discount">
                            -{item.discountPercentage}%
                          </span>
                        </>
                      )}
                    </div>

                    {/* Stock status */}
                    {/* <p
                      className={`text-[11px] font-medium ${
                        item.inStock ? "text-green" : "text-discount"
                      }`}
                    >
                      {item.inStock ? t("inStock") : t("outOfStock")}
                    </p> */}

                    {/* Add to cart */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={
                        !item.inStock || addingToCart === item.productId
                      }
                      className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-sm bg-dark py-2 text-sm font-semibold text-white transition-colors hover:bg-dark/85 disabled:opacity-50"
                    >
                      {addingToCart === item.productId ? "..." : t("addToCart")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
