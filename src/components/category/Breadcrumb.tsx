import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import type { Category } from "@/types/category";
import { getCategoryName } from "@/lib/category-helpers";

interface BreadcrumbProps {
  breadcrumb: Category[];
  currentName: string;
}

export default async function Breadcrumb({
  breadcrumb,
  currentName,
}: BreadcrumbProps) {
  const locale = await getLocale();
  const t = await getTranslations("categoryPage");

  return (
    <nav aria-label="Breadcrumb" className="mb-4 py-3">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-gray-text">
        <li>
          <Link href="/" className="hover:text-primary">
            {t("home")}
          </Link>
        </li>
        {breadcrumb.map((cat) => (
          <li key={cat.id} className="flex items-center gap-1">
            <ChevronRight
              size={12}
              className="rtl:rotate-180"
            />
            <Link
              href={`/categories/${cat.slug}`}
              className="hover:text-primary"
            >
              {getCategoryName(cat, locale)}
            </Link>
          </li>
        ))}
        <li className="flex items-center gap-1">
          <ChevronRight
            size={12}
            className="rtl:rotate-180"
          />
          <span className="font-medium text-dark">{currentName}</span>
        </li>
      </ol>
    </nav>
  );
}
