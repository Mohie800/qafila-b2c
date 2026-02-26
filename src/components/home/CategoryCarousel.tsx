"use client";

import { useLocale } from "next-intl";
import CategoryItem from "@/components/shared/CategoryItem";
import Carousel from "@/components/shared/Carousel";
import { useActiveCategory } from "@/lib/active-category-context";
import { getMediaUrl } from "@/lib/utils";

export default function CategoryCarousel() {
  const locale = useLocale();
  const { activeRootSlug, categoryTree } = useActiveCategory();

  const activeRoot = categoryTree.find(
    (c) => c.parentId === null && c.slug === activeRootSlug,
  );

  const subcategories = activeRoot?.children ?? [];

  if (subcategories.length === 0) return null;

  return (
    <section className="mx-4 max-w-360 px-0 py-5 md:mx-20">
      <Carousel>
        <div className="flex gap-5 px-2 py-2">
          {subcategories.map((cat) => (
            <CategoryItem
              key={cat.slug}
              label={locale === "ar" ? cat.nameAr || cat.name : cat.name}
              href={`/categories/${cat.slug}`}
              image={getMediaUrl(cat.image) ?? null}
            />
          ))}
        </div>
      </Carousel>
    </section>
  );
}
