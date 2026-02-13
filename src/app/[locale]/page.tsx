import { getLocale, setRequestLocale } from "next-intl/server";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryCarousel from "@/components/home/CategoryCarousel";
import RecommendedBanner from "@/components/home/RecommendedBanner";
import SaudiMadeBanner from "@/components/home/SaudiMadeBanner";
import BestSeller from "@/components/home/BestSeller";
import SellCta from "@/components/home/SellCta";
import { getForYou, getBestSellers } from "@/lib/api/recommendations";
import type { RecommendationProduct } from "@/types/product";
import type { Product } from "@/components/shared/ProductCard";

function mapProduct(item: RecommendationProduct, locale: string): Product {
  const hasSale = item.salePrice != null && item.salePrice < item.price;
  const displayPrice = hasSale ? item.salePrice! : item.price;
  const originalPrice = hasSale ? item.price : null;
  const discount = hasSale
    ? Math.round(((item.price - item.salePrice!) / item.price) * 100)
    : null;

  const name =
    locale === "ar"
      ? item.brand?.nameAr || item.brand?.name || item.titleAr || item.title
      : item.brand?.name || item.title;

  const description = locale === "ar" ? item.titleAr || item.title : item.title;

  return {
    id: item.id,
    name,
    description,
    price: displayPrice,
    originalPrice,
    discount,
    rating: item.averageRating,
    reviews: item.reviewCount,
    trending: item.isFeatured,
    badge: hasSale ? `${discount}%` : null,
    image: item.imageUrl,
    slug: item.slug,
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let forYouProducts: Product[] = [];
  let bestSellerProducts: Product[] = [];

  try {
    const [forYouRes, bestSellersRes] = await Promise.all([
      getForYou({ limit: 10 }),
      getBestSellers({ limit: 10 }),
    ]);
    forYouProducts = forYouRes.data.map((item) => mapProduct(item, locale));
    bestSellerProducts = bestSellersRes.data.map((item) =>
      mapProduct(item, locale),
    );
  } catch {
    // API unavailable — sections will render empty gracefully
  }

  return (
    <>
      <HeroBanner />
      <CategoryCarousel />
      <RecommendedBanner products={forYouProducts} />
      <SaudiMadeBanner products={forYouProducts} />
      <BestSeller products={bestSellerProducts} />
      <SellCta />
    </>
  );
}
