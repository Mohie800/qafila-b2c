"use client";

import { useTranslations } from "next-intl";
import { Minus, Plus, Trash2, AlertTriangle } from "lucide-react";
import SarIcon from "@/components/shared/SarIcon";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getMediaUrl } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import type { CartItem } from "@/types/cart";
import { useState } from "react";

interface CartItemRowProps {
  item: CartItem;
  locale: string;
}

export default function CartItemRow({ item, locale }: CartItemRowProps) {
  const t = useTranslations();
  const { updateQuantity, removeItem } = useCart();
  const [updating, setUpdating] = useState(false);

  const title = locale === "ar" ? item.productTitleAr : item.productTitle;
  const displayPrice = item.salePrice ?? item.unitPrice;
  const hasDiscount = item.salePrice !== null && item.salePrice < item.unitPrice;

  const handleQuantityChange = async (newQty: number) => {
    if (newQty < 1 || newQty > item.availableStock || updating) return;
    setUpdating(true);
    try {
      await updateQuantity(item.id, newQty);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    setUpdating(true);
    try {
      await removeItem(item.id);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex gap-4 p-4 sm:p-6">
      {/* Product image */}
      <Link href={`/products/${item.productSlug}`} className="shrink-0">
        <div className="relative h-28 w-24 overflow-hidden rounded-lg bg-gray-light sm:h-32 sm:w-28">
          {item.productImage ? (
            <Image
              src={getMediaUrl(item.productImage) || item.productImage}
              alt={title}
              fill
              className="object-cover"
              sizes="112px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-text">
              <Image
                src="/images/empty-cart.svg"
                alt=""
                width={60}
                height={48}
              />
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/products/${item.productSlug}`}
            className="text-sm font-semibold text-dark hover:text-primary sm:text-base"
          >
            {title}
          </Link>

          {/* Variant details */}
          {item.variantDetails && (
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-text">
              {item.variantDetails.color && (
                <span>
                  {typeof item.variantDetails.color === "string"
                    ? item.variantDetails.color
                    : locale === "ar"
                      ? item.variantDetails.color.nameAr || item.variantDetails.color.name
                      : item.variantDetails.color.name}
                </span>
              )}
              {item.variantDetails.size && (
                <span>
                  {typeof item.variantDetails.size === "string"
                    ? item.variantDetails.size
                    : locale === "ar"
                      ? item.variantDetails.size.nameAr || item.variantDetails.size.name
                      : item.variantDetails.size.name}
                </span>
              )}
              {item.variantDetails.sku && (
                <span>SKU: {item.variantDetails.sku}</span>
              )}
            </div>
          )}

          {/* Warnings */}
          {item.priceChanged && (
            <div className="mt-1 flex items-center gap-1 text-xs text-primary">
              <AlertTriangle size={12} />
              {t("cart.priceChanged")}
            </div>
          )}
          {!item.inStock && (
            <div className="mt-1 text-xs font-medium text-discount">
              {t("cart.outOfStock")}
            </div>
          )}
          {item.exceedsStock && item.inStock && (
            <div className="mt-1 text-xs text-primary">
              {t("cart.exceedsStock", { count: item.availableStock })}
            </div>
          )}
        </div>

        {/* Price & controls row */}
        <div className="mt-3 flex items-center justify-between">
          {/* Quantity controls */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-border">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1 || updating}
              className="flex h-8 w-8 items-center justify-center text-gray-text transition-colors hover:text-dark disabled:opacity-40"
            >
              <Minus size={14} />
            </button>
            <span className="min-w-[2rem] text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= item.availableStock || updating}
              className="flex h-8 w-8 items-center justify-center text-gray-text transition-colors hover:text-dark disabled:opacity-40"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRemove}
              disabled={updating}
              className="flex items-center gap-1 text-xs text-gray-text transition-colors hover:text-discount disabled:opacity-40"
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">{t("cart.remove")}</span>
            </button>

            <div className="text-end">
              <div className="text-sm font-bold text-dark sm:text-base" dir="ltr">
                <SarIcon /> {item.lineTotal.toFixed(2)}
              </div>
              {hasDiscount && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-text line-through" dir="ltr">
                    <SarIcon /> {(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-discount">
                    -{item.discountPercentage}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
