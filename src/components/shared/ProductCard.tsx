"use client";

import { useTranslations } from "next-intl";
import { Heart, Star, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  rating: number;
  reviews: number;
  trending: boolean;
  badge: string | null;
  image?: string | null;
  slug?: string | null;
}

export default function ProductCard({
  product,
  variant = "carousel",
}: {
  product: Product;
  variant?: "carousel" | "grid";
}) {
  const t = useTranslations("product");

  const content = (
    <div
      className={` cursor-pointer rounded-lg bg-white border border-gray-200  h-full ${
        variant === "grid" ? "w-full" : "min-w-57.5 max-w-62.5 shrink-0"
      }`}
    >
      {/* Image */}
      <div className="relative mb-2.5 min-h-80 overflow-hidden rounded-t-lg bg-gray-100">
        {product.badge && (
          <span className="absolute start-2.5 top-2.5 z-10 rounded bg-discount px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            {product.badge}
          </span>
        )}
        <button
          className="absolute end-2.5 top-2.5 z-10"
          aria-label="Add to wishlist"
          onClick={(e) => e.preventDefault()}
        >
          <Heart
            size={18}
            className="text-gray-400 transition-colors hover:text-discount"
          />
        </button>
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes={
              variant === "grid"
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                : "210px"
            }
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-300">
            Product Image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1 p-1.5">
        <h3 className="text-xs font-bold uppercase tracking-wide text-dark">
          {product.name}
        </h3>
        <p className="truncate text-[11px] text-gray-text">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold">{product.rating}</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={10}
                className={
                  i < Math.floor(product.rating)
                    ? "fill-star text-star"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-text">
            ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-dark">
            <span className="text-[10px]">﷼</span>{" "}
            {Number(product.price).toFixed(1)}
          </span>
          {product.originalPrice && (
            <span className="text-[11px] text-gray-text line-through">
              {Number(product.originalPrice).toFixed(1)}
            </span>
          )}
          {product.discount && (
            <span className="text-[11px] font-semibold text-discount">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Trending */}
        {product.trending && (
          <div className="flex items-center gap-1">
            <TrendingUp size={12} className="text-green" />
            <span className="text-[11px] font-medium text-green">
              {t("trendingNow")}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (product.slug) {
    return (
      <Link href={`/products/${product.slug}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
