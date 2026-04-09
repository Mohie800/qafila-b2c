import { getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function AppDownload() {
  const t = await getTranslations("appDownload");

  return (
    <section className="mx-4 max-w-360 md:mx-20">
      <div className=" flex max-w-360 items-center justify-between px-6 py-8 md:py-0 bg-gray-light dark:bg-dark rounded-2xl my-10">
        {/* Phones image */}
        <div className="hidden shrink-0 md:block">
          <Image
            src="/images/phones.svg"
            alt="Qafila App"
            width={341}
            height={219}
            className="h-auto w-70 lg:w-200"
            priority={false}
          />
        </div>

        {/* Text + Store buttons */}
        <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-start">
          <h2 className="text-xl font-bold text-dark dark:text-gray-100 md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-2 text-xl font-medium text-gray-text">
            {t("subtitle")}
          </p>
          <div className="mt-5 flex gap-3 w-full justify-center">
            {/* App Store */}
            <a
              href="#"
              className="flex items-center gap-2 rounded-lg bg-dark px-4 py-2.5 transition-opacity hover:opacity-90"
            >
              <Image
                src="/images/apple-icon.svg"
                alt="Apple"
                width={20}
                height={24}
              />
              <div className="text-start text-white">
                <p className="text-[14px] leading-none">{t("downloadOn")}</p>
                <p className="text-xl font-semibold leading-tight">
                  {t("appStore")}
                </p>
              </div>
            </a>

            {/* Google Play */}
            <a
              href="#"
              className="flex items-center gap-2 rounded-lg bg-dark px-4 py-2.5 transition-opacity hover:opacity-90"
            >
              <Image
                src="/images/google-play-icon.svg"
                alt="Google Play"
                width={22}
                height={24}
              />
              <div className="text-start text-white">
                <p className="text-[14px] leading-none">{t("getItOn")}</p>
                <p className="text-xl font-semibold leading-tight">
                  {t("googlePlay")}
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
