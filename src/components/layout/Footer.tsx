"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import QafilaLogo from "@/components/shared/QafilaLogo";
import Image from "next/image";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function SnapchatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.04-.012.06-.012.074-.012.16 0 .3.075.42.194.12.12.18.272.18.405 0 .24-.18.45-.48.57-.07.03-.18.06-.3.09-.18.06-.39.12-.57.21-.36.18-.57.39-.66.57a.65.65 0 0 0-.06.27c.06.39.27.78.54 1.17.33.45.72.87 1.17 1.23.45.39.93.72 1.47.96.12.06.24.12.33.18.12.06.21.18.21.3 0 .15-.09.27-.21.36-.18.12-.42.24-.69.3-.3.09-.6.12-.87.12-.09 0-.18 0-.27-.015-.12-.015-.27-.03-.45-.06-.24-.03-.54-.06-.87-.09-.51-.03-1.08.15-1.59.42-.54.27-1.02.63-1.44.99-.45.39-.93.63-1.44.69-.06 0-.12.01-.18.01h-.15c-.51-.06-.99-.3-1.44-.69-.42-.36-.9-.72-1.44-.99-.51-.27-1.08-.45-1.59-.42-.33.03-.63.06-.87.09-.18.03-.33.045-.45.06-.09.015-.18.015-.27.015-.27 0-.57-.03-.87-.12-.27-.06-.51-.18-.69-.3-.12-.09-.21-.21-.21-.36 0-.12.09-.24.21-.3.09-.06.21-.12.33-.18.54-.24 1.02-.57 1.47-.96.45-.36.84-.78 1.17-1.23.27-.39.48-.78.54-1.17a.65.65 0 0 0-.06-.27c-.09-.18-.3-.39-.66-.57-.18-.09-.39-.15-.57-.21-.12-.03-.23-.06-.3-.09-.3-.12-.48-.33-.48-.57 0-.133.06-.285.18-.405.12-.12.26-.194.42-.194.015 0 .034 0 .074.012.263.094.623.214.922.214.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.653 1.069 11.01.793 12 .793h.206z" />
    </svg>
  );
}

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer className="bg-dark text-white">
      {/* Top section */}
      <div className="mx-auto max-w-360 px-6 py-10">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-gray-700 pb-10 md:flex-row md:items-center">
          {/* Logo */}
          <div className="flex items-center gap-1.5">
            <Image
              src={"/logo-footer.svg"}
              height={24}
              width={120}
              alt="qafila"
            />
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t("subscribe")}
            </span>
            <div className="flex">
              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                className="rounded-s-md border border-gray-600 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-gray-500 focus:border-primary"
              />
              <button className="rounded-e-md bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
                {t("subscribeBtn")}
              </button>
            </div>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t("followUs")}
            </span>
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="X / Twitter"
                className="text-white hover:text-primary"
              >
                <XIcon />
              </a>
              <a
                href="#"
                aria-label="Snapchat"
                className="text-white hover:text-primary"
              >
                <SnapchatIcon />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="text-white hover:text-primary"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-white hover:text-primary"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-8 pt-10 md:grid-cols-3 lg:grid-cols-6">
          {/* Top Brands */}
          <div>
            <h4 className="mb-4 text-sm font-bold">{t("topBrands")}</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  {t("brands.atelierHekayat")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("brands.uscita")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("brands.hajruss")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("brands.kafByKaf")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("brands.atelierHekayat")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("brands.hindamme")}
                </a>
              </li>
            </ul>
          </div>

          {/* Discover Now */}
          <div>
            <h4 className="mb-4 text-sm font-bold">{t("discoverNow")}</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  {t("discover.mensFashion")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("discover.womensFashion")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("discover.kids")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("discover.luxuryGoods")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("discover.eyewear")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("discover.beautyPersonalCare")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("discover.toysPassion")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("discover.furniture")}
                </a>
              </li>
            </ul>
          </div>

          {/* Top Categories */}
          <div>
            <h4 className="mb-4 text-sm font-bold">{t("topCategories")}</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  {t("topCats.clothing")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("topCats.shoes")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("topCats.sandless")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("topCats.glasses")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("topCats.pants")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("topCats.suites")}
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="mb-4 text-sm font-bold">{t("customerCare")}</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  {t("care.contactUs")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("care.faqs")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("care.payment")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("care.trackOrder")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("care.aboutUs")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("care.careers")}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-bold">{t("legal")}</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  {t("legalLinks.termsConditions")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("legalLinks.privacyPolicy")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("legalLinks.returnPolicy")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("legalLinks.shippingDelivery")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  {t("legalLinks.ksaVat")}
                </a>
              </li>
            </ul>
          </div>

          {/* Qafila Apps */}
          <div>
            <h4 className="mb-4 text-sm font-bold">{t("qafilaApps")}</h4>
            <div className="flex flex-col gap-2">
              <a
                href="#"
                className="flex items-center gap-2 rounded-lg border border-gray-600 px-3 py-2 transition-colors hover:border-gray-400"
              >
                <Image
                  src="/images/apple-icon.svg"
                  alt="Apple"
                  width={18}
                  height={22}
                  className="shrink-0"
                />
                <div className="text-start">
                  <p className="text-[8px] leading-none text-gray-400">
                    {t("downloadOn")}
                  </p>
                  <p className="text-xs font-semibold leading-tight text-white">
                    {t("appStore")}
                  </p>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 rounded-lg border border-gray-600 px-3 py-2 transition-colors hover:border-gray-400"
              >
                <Image
                  src="/images/google-play-icon.svg"
                  alt="Google Play"
                  width={20}
                  height={22}
                  className="shrink-0"
                />
                <div className="text-start">
                  <p className="text-[8px] leading-none text-gray-400">
                    {t("getItOn")}
                  </p>
                  <p className="text-xs font-semibold leading-tight text-white">
                    {t("googlePlay")}
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
