import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { Banner } from "@/lib/api/banners";
import HeroBannerCarousel from "./HeroBannerCarousel";

interface Props {
  banners?: Banner[];
}

export default async function HeroBanner({ banners = [] }: Props) {
  if (banners.length > 0) {
    return <HeroBannerCarousel banners={banners} />;
  }

  const t = await getTranslations("hero");

  return (
    <section className="w-full">
      <div className="flex h-85 md:h-110">
        <div className="relative flex flex-1 items-center justify-center overflow-hidden mx-4 mt-4 md:mx-20 md:mt-10">
          <div className="absolute inset-0 bg-linear-to-br from-[#2D4A3E] via-[#3A5A4A] to-[#5A7A5E]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_46%,rgba(139,119,101,0.12)_47%,rgba(139,119,101,0.12)_49%,transparent_50%)] bg-[length:70px_100%]" />
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
