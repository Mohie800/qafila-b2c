"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getMediaUrl } from "@/lib/utils";
import type { Banner } from "@/lib/api/banners";

interface Props {
  banners: Banner[];
}

const AUTOPLAY_MS = 6000;

function resolveHref(banner: Banner): {
  href: string | null;
  external: boolean;
} {
  switch (banner.linkType) {
    case "PRODUCT":
      return banner.linkId
        ? { href: `/products/${banner.linkId}`, external: false }
        : { href: null, external: false };
    case "CATEGORY":
      return banner.linkId
        ? { href: `/categories/${banner.linkId}`, external: false }
        : { href: null, external: false };
    case "EXTERNAL":
      return banner.linkUrl
        ? { href: banner.linkUrl, external: true }
        : { href: null, external: false };
    case "NONE":
    default:
      return { href: null, external: false };
  }
}

export default function HeroBannerCarousel({ banners }: Props) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = useMemo(
    () =>
      banners.map((b) => {
        const rawImage = isRtl ? b.imageAr || b.image : b.image;
        const { href, external } = resolveHref(b);
        return {
          id: b.id,
          alt: isRtl ? b.nameAr || b.name : b.name,
          src: getMediaUrl(rawImage) ?? rawImage,
          href,
          external,
        };
      }),
    [banners, isRtl],
  );

  const goTo = useCallback(
    (next: number) => {
      if (slides.length === 0) return;
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isPaused]);

  if (slides.length === 0) return null;

  return (
    <section className="w-full">
      <div className="mx-4 mt-4 md:mx-20 md:mt-10">
        <div
          className="group relative h-85 w-full overflow-hidden rounded-2xl bg-[rgb(245,243,240)] md:h-110"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          aria-roledescription="carousel"
        >
          {/* Slides */}
          {slides.map((slide, i) => {
            const isActive = i === index;
            const content = (
              <div
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  isActive
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
                aria-hidden={!isActive}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 1280px, (min-width: 768px) 90vw, 100vw"
                  className="object-cover"
                />
              </div>
            );

            if (slide.href) {
              if (slide.external) {
                return (
                  <a
                    key={slide.id}
                    href={slide.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label={slide.alt}
                    tabIndex={isActive ? 0 : -1}
                  >
                    {content}
                  </a>
                );
              }
              return (
                <Link
                  key={slide.id}
                  href={slide.href}
                  className="absolute inset-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label={slide.alt}
                  tabIndex={isActive ? 0 : -1}
                >
                  {content}
                </Link>
              );
            }

            return (
              <div key={slide.id} className="absolute inset-0">
                {content}
              </div>
            );
          })}

          {/* Prev / next controls */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous banner"
                className="absolute top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-2 text-dark opacity-0 shadow-md backdrop-blur transition group-hover:opacity-100 hover:bg-white md:flex"
                style={isRtl ? { right: "1rem" } : { left: "1rem" }}
              >
                {isRtl ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next banner"
                className="absolute top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-2 text-dark opacity-0 shadow-md backdrop-blur transition group-hover:opacity-100 hover:bg-white md:flex"
                style={isRtl ? { left: "1rem" } : { right: "1rem" }}
              >
                {isRtl ? (
                  <ChevronLeft className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
                {slides.map((s, i) => {
                  const active = i === index;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Go to banner ${i + 1}`}
                      aria-current={active}
                      className={`h-1.5 rounded-full bg-white/90 shadow transition-all duration-300 ${
                        active ? "w-6" : "w-1.5 bg-white/60 hover:bg-white/90"
                      }`}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
