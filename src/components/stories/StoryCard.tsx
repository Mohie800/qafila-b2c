"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { BadgeCheck } from "lucide-react";
import SarIcon from "@/components/shared/SarIcon";
import { getMediaUrl } from "@/lib/utils";
import type { Story } from "@/types/story";

interface StoryCardProps {
  story: Story;
  onClick: () => void;
}

export default function StoryCard({ story, onClick }: StoryCardProps) {
  const locale = useLocale();
  const vendorName =
    locale === "ar"
      ? story.vendor.storeNameAr || story.vendor.storeName
      : story.vendor.storeName;

  const mediaUrl = getMediaUrl(story.mediaUrl);
  const vendorLogo = getMediaUrl(story.vendor.logo);
  const caption = locale === "ar" ? story.captionAr || story.caption : story.caption;

  return (
    <button
      onClick={onClick}
      className="group relative flex aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-xl bg-gray-100 text-start"
    >
      {/* Story Media */}
      {mediaUrl && story.mediaType === "VIDEO" ? (
        <video
          src={mediaUrl}
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onMouseEnter={(e) => e.currentTarget.play()}
          onMouseLeave={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
        />
      ) : mediaUrl ? (
        <Image
          src={mediaUrl}
          alt={caption || vendorName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      ) : null}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Product tooltip bubble */}
      {story.linkedProduct && (
        <div className="absolute start-3 top-1/2 -translate-y-1/2 z-10">
          <div className="relative rounded-lg bg-white/95 p-2 shadow-lg backdrop-blur-sm max-w-[140px]">
            <div className="flex items-center gap-2">
              {story.linkedProduct.image && (
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded">
                  <Image
                    src={getMediaUrl(story.linkedProduct.image) || ""}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-[10px] font-medium text-dark">
                  {locale === "ar"
                    ? story.linkedProduct.nameAr || story.linkedProduct.name
                    : story.linkedProduct.name}
                </p>
                <p className="text-[10px] font-bold text-primary" dir="ltr">
                  <SarIcon /> {Number(story.linkedProduct.price).toFixed(1)}
                </p>
              </div>
            </div>
            {/* Bubble arrow */}
            <div className="absolute -bottom-1.5 start-4 h-3 w-3 rotate-45 bg-white/95" />
          </div>
        </div>
      )}

      {/* Vendor info at bottom */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 p-3">
        {vendorLogo ? (
          <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border-2 border-white">
            <Image
              src={vendorLogo}
              alt={vendorName}
              fill
              className="object-cover"
              sizes="28px"
            />
          </div>
        ) : (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[10px] font-bold text-dark">
            {vendorName.charAt(0)}
          </div>
        )}
        <div className="flex items-center gap-1 min-w-0">
          <span className="truncate text-xs font-semibold text-white drop-shadow-sm">
            {vendorName}
          </span>
          <BadgeCheck size={14} className="shrink-0 fill-blue-500 text-white" />
        </div>
      </div>

      {/* Unseen ring indicator */}
      {!story.hasViewed && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-primary ring-offset-2 pointer-events-none" />
      )}
    </button>
  );
}
