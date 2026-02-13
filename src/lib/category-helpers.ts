const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export function resolveImage(image: string | null): string | null {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  return `${API_URL}${image}`;
}

export function getCategoryName(
  cat: { name: string; nameAr: string },
  locale: string,
): string {
  return locale === "ar" ? cat.nameAr || cat.name : cat.name;
}
