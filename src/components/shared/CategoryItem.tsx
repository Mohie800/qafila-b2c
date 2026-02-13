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
      className="group flex flex-shrink-0 flex-col items-center gap-2"
    >
      <div className="flex h-[75px] w-[75px] items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 transition-shadow group-hover:shadow-md">
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
      <span className="max-w-[80px] truncate text-center text-[11px] font-medium text-dark">
        {label}
      </span>
    </Link>
  );
}
