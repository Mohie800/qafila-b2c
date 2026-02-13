import { getLocale } from "next-intl/server";
import CategoryItem from "@/components/shared/CategoryItem";
import Carousel from "@/components/shared/Carousel";
import { getCategories } from "@/lib/api/categories";
import { resolveImage } from "@/lib/category-helpers";

export default async function CategoryCarousel() {
  const locale = await getLocale();

  let categories: { name: string; slug: string; image: string | null }[] = [];

  try {
    const res = await getCategories({
      rootOnly: true,
      isActive: true,
      limit: 20,
    });
    categories = res.data.map((cat) => ({
      name: locale === "ar" ? cat.nameAr || cat.name : cat.name,
      slug: cat.slug,
      image: resolveImage(cat.image),
    }));
  } catch {
    // API unavailable — render empty; will show nothing gracefully
    categories = [];
  }

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-360 px-10 py-5">
      <Carousel>
        <div className="flex gap-5 px-2 py-2">
          {categories.map((cat) => (
            <CategoryItem
              key={cat.slug}
              label={cat.name}
              href={`/categories/${cat.slug}`}
              image={cat.image}
            />
          ))}
        </div>
      </Carousel>
    </section>
  );
}
