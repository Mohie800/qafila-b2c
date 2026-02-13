"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0) setActiveIndex(images.length - 1);
      else if (index >= images.length) setActiveIndex(0);
      else setActiveIndex(index);
    },
    [images.length],
  );

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-300">
        No Image
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      {/* Thumbnails — horizontal on mobile, vertical on desktop */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto lg:flex-col lg:overflow-y-auto lg:max-h-[540px]">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActiveIndex(i)}
            className={`relative flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
              i === activeIndex
                ? "border-primary"
                : "border-transparent hover:border-gray-border"
            }`}
            style={{ width: 72, height: 72 }}
          >
            <Image
              src={img.url}
              alt={img.alt || `${productName} ${i + 1}`}
              fill
              className="object-cover"
              sizes="72px"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="relative flex-1 aspect-square overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={activeImage.url}
          alt={activeImage.alt || productName}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() => goTo(activeIndex - 1)}
              className="absolute start-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-sm transition-colors hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} className="rtl:rotate-180" />
            </button>
            <button
              onClick={() => goTo(activeIndex + 1)}
              className="absolute end-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-sm transition-colors hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight size={18} className="rtl:rotate-180" />
            </button>
          </>
        )}

        {/* Dots (mobile) */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 lg:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-white/60"
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
