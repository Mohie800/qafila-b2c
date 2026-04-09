import { Link } from "@/i18n/navigation";
import Image from "next/image";

interface CategoryItemProps {
  label: string;
  href?: string;
  image?: string | null;
}

export default function CategoryItem({
  label,
  href = "#",
  image,
}: CategoryItemProps) {
  return (
    <Link
      href={href}
      className="group flex shrink-0 flex-col items-center gap-2"
    >
      <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark transition-shadow group-hover:shadow-md">
        {image ? (
          <Image
            src={image}
            alt={label}
            width={75}
            height={75}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-center text-[9px] text-gray-400">
            {label.charAt(0)}
          </span>
        )}
      </div>
      <span className="max-w-20 truncate text-center text-[11px] font-medium text-dark dark:text-gray-200">
        {label}
      </span>
    </Link>
  );
}
