import { getTranslations } from "next-intl/server";
import ProductCard, { type Product } from "@/components/shared/ProductCard";
import Image from "next/image";

interface Props {
  products: Product[];
}

export default async function RecommendedBanner({ products }: Props) {
  const t = await getTranslations("recommended");

  return (
    <section className="mx-auto max-w-360 px-6 py-6">
      {/* Top: Banner */}
      <div className="relative mb-5 flex h-65 w-full items-center overflow-hidden  md:h-95">
        {/* Gradient background */}

        <Image
          src={"/for-you.png"}
          alt="Recommended Background"
          fill
          className="object-cover object-center opacity-100 "
        />

        <div className="relative z-10 px-8 md:px-12">
          <h2 className="font-serif text-[36px] font-bold italic leading-[1.05] text-white md:text-[44px]">
            {t("title")}
          </h2>
          <h2 className="mt-0.5 font-serif text-[36px] font-bold italic leading-[1.05] text-white md:text-[44px]">
            {t("forYou")}
          </h2>
          <button className="mt-6 rounded-full border-2 border-white px-7 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-dark">
            {t("shopNow")}
          </button>
        </div>
      </div>

      {/* Bottom: Product cards */}
      <div className="scrollbar-hide flex gap-4 overflow-x-auto">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
