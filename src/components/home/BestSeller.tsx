import { getTranslations } from "next-intl/server";
import ProductCard, { type Product } from "@/components/shared/ProductCard";
import Carousel from "@/components/shared/Carousel";
import { Link } from "@/i18n/navigation";

interface Props {
  products: Product[];
}

export default async function BestSeller({ products }: Props) {
  const t = await getTranslations("bestSeller");

  if (products.length === 0) return null;

  return (
    <section className="mx-4 max-w-360 px-0 py-6 md:mx-20">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-dark">{t("title")}</h2>
        <Link
          href="#"
          className="flex items-center gap-1 text-sm text-gray-text transition-colors hover:text-dark"
        >
          {t("seeAll")}
          <span className="rtl:rotate-180">›</span>
        </Link>
      </div>

      {/* Product cards */}
      <Carousel>
        <div className="flex gap-4 px-2 py-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Carousel>
    </section>
  );
}
