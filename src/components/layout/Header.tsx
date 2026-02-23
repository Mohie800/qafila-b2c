"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import {
  Search,
  Heart,
  ShoppingBasket,
  Menu,
  ChevronDown,
  ChevronRight,
  Globe,
  Clapperboard,
  User,
  CircleHelp,
  LogOut,
  Bell,
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import MegaMenu from "@/components/layout/MegaMenu";
import type { Category } from "@/types/category";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useActiveCategory } from "@/lib/active-category-context";
import LoginModal from "@/components/auth/LoginModal";

interface HeaderProps {
  categoryTree?: Category[];
}

export default function Header({ categoryTree = [] }: HeaderProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, user, logout } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const loginDropdownRef = useRef<HTMLDivElement>(null);

  const rootTabs = categoryTree.filter((c) => c.parentId === null);
  const { activeRootSlug, setActiveRootSlug } = useActiveCategory();

  const switchLocale = (newLocale: "en" | "ar") => {
    router.replace(pathname, { locale: newLocale });
    setLangOpen(false);
  };

  const handleTabClick = (slug: string) => {
    setActiveRootSlug(slug);
    // if (!menuOpen) setMenuOpen(true);
  };

  const closeMegaMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  // Close login dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        loginDropdownRef.current &&
        !loginDropdownRef.current.contains(e.target as Node)
      ) {
        setLoginDropdownOpen(false);
      }
    };
    if (loginDropdownOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [loginDropdownOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        {/* Top Bar */}
        <div className="bg-dark text-white ">
          <div className="mx-auto flex max-w-360 items-stretch justify-between px-6 text-sm">
            {/* Left - Tabs */}
            <div className="flex items-stretch gap-4">
              {rootTabs.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleTabClick(cat.slug)}
                  className={`flex items-center px-2 py-2 transition-colors font-medium ${
                    activeRootSlug === cat.slug
                      ? "text-black bg-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {locale === "ar" ? cat.nameAr || cat.name : cat.name}
                </button>
              ))}
            </div>

            {/* Center - Apple Pay */}
            <span className="hidden items-center text-xs font-medium md:flex">
              {t("topBar.applePay")}
            </span>

            {/* Right - Language */}
            <div className="relative flex items-center gap-3 py-2">
              <div className="flex items-center gap-1">
                <Globe size={14} />
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1 text-xs"
                >
                  {locale === "en" ? t("topBar.english") : t("topBar.arabic")}
                  <ChevronDown size={12} />
                </button>
              </div>
              {langOpen && (
                <div className="absolute end-0 top-full mt-1 min-w-30 rounded bg-dark shadow-lg">
                  <button
                    onClick={() => switchLocale("en")}
                    className="block w-full px-4 py-2 text-start text-xs hover:bg-gray-700"
                  >
                    {t("topBar.english")}
                  </button>
                  <button
                    onClick={() => switchLocale("ar")}
                    className="block w-full px-4 py-2 text-start text-xs hover:bg-gray-700"
                  >
                    {t("topBar.arabic")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Bar - Logo, Search, Icons */}
        <div className="border-b border-gray-border">
          <div className="mx-auto flex max-w-360 items-center justify-between gap-4 px-6 py-3">
            {/* Logo */}
            <Link href="/" className="shrink-0">
              <div className="flex items-center gap-1.5">
                <Image src={"/logo.svg"} height={48} width={150} alt="qafila" />
              </div>
            </Link>

            {/* Search */}
            <div className="relative hidden max-w-md flex-1 md:block">
              <Search
                size={16}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-text"
              />
              <input
                type="text"
                placeholder={t("search.placeholder")}
                className="w-full rounded-full border border-gray-border bg-gray-light py-2.5 pe-4 ps-10 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-5">
              <Link
                href="/stories"
                className="hidden items-center gap-1.5 text-sm text-dark md:flex"
              >
                <Clapperboard size={18} />
                <span>{t("header.stories")}</span>
              </Link>
              <Link
                href="/profile/wishlist"
                className="relative flex items-center gap-1.5 text-sm text-dark"
              >
                <Heart size={18} />
                <span className="hidden md:inline">{t("header.wishlist")}</span>
                {wishlistCount > 0 && (
                  <span className="absolute -end-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-discount px-1 text-[10px] font-bold text-white">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                className="relative flex items-center gap-1.5 text-sm text-dark"
              >
                <ShoppingBasket size={18} />
                <span className="hidden md:inline">{t("header.cart")}</span>
                {itemCount > 0 && (
                  <span className="absolute -end-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>

              {/* Divider */}
              <div className="hidden h-5 w-px bg-gray-border md:block" />

              {/* Notifications */}
              <Link
                href="/profile/notifications"
                className="relative hidden text-dark md:block"
              >
                <Bell size={18} />
              </Link>

              {/* Divider */}
              <div className="hidden h-5 w-px bg-gray-border md:block" />

              {/* Login / User dropdown */}
              <div className="relative" ref={loginDropdownRef}>
                <button
                  onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                  className="flex items-center gap-1.5 text-sm text-dark cursor-pointer"
                >
                  {isLoggedIn ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-dark">
                      {(user?.firstName?.[0] || "").toUpperCase()}
                      {(user?.lastName?.[0] || "").toUpperCase()}
                    </span>
                  ) : (
                    <>
                      <User size={18} />
                      <span className="hidden md:inline">
                        {t("auth.logIn")}
                      </span>
                    </>
                  )}
                  <ChevronDown size={14} className="hidden md:block" />
                </button>

                {loginDropdownOpen && (
                  <div className="absolute end-0 top-full mt-3 w-72 rounded-xl bg-white shadow-lg ring-1 ring-gray-border z-10">
                    {/* Arrow */}
                    <div className="absolute -top-1.5 end-5 h-3 w-3 rotate-45 border-s border-t border-gray-border bg-white" />

                    {isLoggedIn ? (
                      <>
                        {/* Greeting */}
                        <div className="px-5 pb-4 pt-5">
                          <p className="text-lg font-semibold text-dark">
                            {t("auth.greeting", {
                              name: user?.firstName || "",
                            })}{" "}
                            <span>👋🏻</span>
                          </p>
                          {user?.email && (
                            <p className="mt-1 text-sm text-gray-text">
                              {user.email}
                            </p>
                          )}
                        </div>

                        {/* Menu Items */}
                        {[
                          { href: "/profile", label: t("auth.myAccount") },
                          { href: "/profile/orders", label: t("auth.orders") },
                          // {
                          //   href: "/profile/returns",
                          //   label: t("auth.returns"),
                          // },
                          {
                            href: "/profile/addresses",
                            label: t("auth.addresses"),
                          },
                          { href: "/contact", label: t("auth.contactUs") },
                          { href: "/faqs", label: t("auth.faqs") },
                        ].map((item, i) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between ${i !== 0 ? "border-t" : ""} border-gray-border px-5 py-3.5 text-sm font-medium text-dark hover:bg-gray-50`}
                            onClick={() => setLoginDropdownOpen(false)}
                          >
                            {item.label}
                            <ChevronRight size={16} className="text-gray-400" />
                          </Link>
                        ))}

                        {/* Logout */}
                        <button
                          onClick={() => {
                            logout();
                            setLoginDropdownOpen(false);
                          }}
                          className="w-full border-t border-gray-border px-5 py-3.5 text-start text-sm text-gray-text hover:bg-gray-50"
                        >
                          {t("auth.logout")}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-3 pb-2 pt-3">
                          <button
                            onClick={() => {
                              setLoginDropdownOpen(false);
                              setLoginModalOpen(true);
                            }}
                            className="w-full rounded-md bg-dark py-2.5 text-xs font-semibold text-white transition-colors hover:bg-dark/90"
                          >
                            {t("auth.loginSignup")}
                          </button>
                        </div>
                        <div className="px-3 pb-2">
                          <button className="w-full rounded-md border border-gray-border py-2.5 text-xs font-semibold text-dark transition-colors hover:bg-gray-50">
                            {t("auth.becomeSeller")}
                          </button>
                        </div>
                        <div className="border-t border-gray-border">
                          <Link
                            href="#"
                            className="flex items-center justify-between px-4 py-2.5 text-sm text-dark hover:bg-gray-50"
                            onClick={() => setLoginDropdownOpen(false)}
                          >
                            <span className="flex items-center gap-2">
                              <CircleHelp size={16} />
                              {t("auth.helpCenter")}
                            </span>
                            <ChevronRight size={16} />
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="relative border-b border-gray-border">
          <div className="mx-auto flex max-w-360 items-center gap-1 px-6 py-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium text-dark hover:bg-gray-50"
            >
              <Menu size={16} />
              {t("nav.categories")}
              <ChevronDown
                size={14}
                className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>
            <Link
              href="#"
              className="rounded px-3 py-1.5 text-sm font-medium text-dark hover:bg-gray-50"
            >
              {t("nav.exclusives")}
            </Link>
            <Link
              href="#"
              className="rounded px-3 py-1.5 text-sm font-bold text-primary"
            >
              {t("nav.hotSales")}
            </Link>
            <Link
              href="#"
              className="rounded px-3 py-1.5 text-sm font-medium text-dark hover:bg-gray-50"
            >
              {t("nav.limitedStock")}
            </Link>
            <Link
              href="#"
              className="rounded px-3 py-1.5 text-sm font-medium text-dark hover:bg-gray-50"
            >
              {t("nav.gifts")}
            </Link>
            <button className="flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium text-dark hover:bg-gray-50">
              {t("nav.saudiFashion")}
              <ChevronDown size={14} />
            </button>
            <Link
              href="#"
              className="ms-1 rounded-full bg-primary px-5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              {t("nav.priceAccess")}
            </Link>
          </div>

          {/* Mega Menu */}
          {menuOpen && categoryTree.length > 0 && (
            <MegaMenu
              categoryTree={categoryTree}
              activeRootSlug={activeRootSlug}
              locale={locale}
              onClose={closeMegaMenu}
            />
          )}
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
}
