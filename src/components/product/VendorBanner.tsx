"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BadgeCheck, Star, Store } from "lucide-react";

export interface VendorData {
  id: string;
  storeName: string;
  slug: string;
  logo?: string | null;
  followersCount?: number;
  averageRating?: number;
}

interface Props {
  vendor: VendorData;
}

function formatFollowers(count: number): string {
  if (count >= 1000) {
    const k = count / 1000;
    return k % 1 === 0 ? `${k} K` : `${k.toFixed(1)} K`;
  }
  return String(count);
}

export default function VendorBanner({ vendor }: Props) {
  const t = useTranslations("productDetail");

  const rating = vendor.averageRating ?? 0;
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <section className="mt-12">
      <Link
        href={`/vendors/${vendor.slug}`}
        className="flex items-center gap-4 rounded-xl bg-[#FFF5EB] px-5 py-4 transition-shadow hover:shadow-md"
      >
        {/* Avatar */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
          {vendor.logo ? (
            <img
              src={vendor.logo}
              alt={vendor.storeName}
              className="h-full w-full object-cover"
            />
          ) : (
            <Store size={24} className="text-gray-400" />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold text-dark">
              {vendor.storeName}
            </span>
            <BadgeCheck size={16} className="shrink-0 fill-blue-500 text-white" />
          </div>

          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-text">
            {vendor.followersCount != null && (
              <>
                <span>
                  {t("followers", {
                    count: formatFollowers(vendor.followersCount),
                  })}
                </span>
                <span className="text-gray-300">|</span>
              </>
            )}
            {rating > 0 && (
              <span className="flex items-center gap-1">
                {rating.toFixed(1)}
                <span className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className={
                        i < fullStars
                          ? "fill-star text-star"
                          : i === fullStars && hasHalf
                            ? "fill-star/50 text-star"
                            : "text-gray-300"
                      }
                    />
                  ))}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Follow button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // TODO: follow/unfollow API
          }}
          className="shrink-0 rounded-full border border-dark px-5 py-1.5 text-xs font-semibold text-dark transition-colors hover:bg-dark hover:text-white"
        >
          {t("follow")}
        </button>
      </Link>
    </section>
  );
}
