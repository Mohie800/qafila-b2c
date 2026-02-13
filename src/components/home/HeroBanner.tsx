import { getTranslations } from "next-intl/server";
import Image from "next/image";

const heroThumbnails = [
  { id: 1, color: "#1A1A1A", label: "Loafers" },
  { id: 2, color: "#C4A87C", label: "Sunglasses" },
  { id: 3, color: "#6B7B8A", label: "Blazer" },
  { id: 4, color: "#8B5E3C", label: "Jacket" },
  { id: 5, color: "#94A3B8", label: "Shirt" },
  { id: 6, color: "#374151", label: "Sweater" },
  { id: 7, color: "#A8B5C2", label: "T-Shirt" },
  { id: 8, color: "#78716C", label: "Polo" },
  { id: 9, color: "#9CA3AF", label: "Watch" },
  { id: 10, color: "#5C6B7A", label: "Bag" },
];

export default async function HeroBanner() {
  const t = await getTranslations("hero");

  return (
    <section className="w-full">
      <div className="flex h-85 md:h-110">
        {/* Main Hero Image Area */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden mx-20 mt-10">
          {/* Background layers simulating outdoor lifestyle photo */}
          <div className="absolute inset-0 bg-linear-to-br from-[#2D4A3E] via-[#3A5A4A] to-[#5A7A5E]" />
          {/* Fence pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_46%,rgba(139,119,101,0.12)_47%,rgba(139,119,101,0.12)_49%,transparent_50%)] bg-[length:70px_100%]" />
          {/* Bottom vignette */}
          <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-black/5" />
          <Image
            src={"/sales-bg.png"}
            alt="Hero Background"
            fill
            className="object-cover object-center opacity-80 "
          />

          <div className="relative z-10 px-6 text-center text-white">
            <h1 className="mb-3 text-3xl font-bold tracking-widest md:text-5xl lg:text-6xl">
              {t("sale")}
            </h1>
            <p className="mx-auto max-w-md text-xs opacity-80 md:text-sm">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
