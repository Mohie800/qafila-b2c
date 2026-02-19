import { getMediaUrl } from "@/lib/utils";

export function resolveImage(image: string | null): string | null {
  return getMediaUrl(image) ?? null;
}

export function getCategoryName(
  cat: { name: string; nameAr: string },
  locale: string,
): string {
  return locale === "ar" ? cat.nameAr || cat.name : cat.name;
}
