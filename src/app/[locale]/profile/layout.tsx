"use client";

import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import LoginModal from "@/components/auth/LoginModal";
import { useState, useEffect } from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("profile");
  const tCat = useTranslations("categoryPage");
  const { isLoggedIn } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isLoggedIn) {
      setLoginModalOpen(true);
    }
  }, [hydrated, isLoggedIn]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-360 px-4 py-20 sm:px-6">
        <div className="flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-360 px-4 pb-12 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 py-3">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-gray-text">
          <li>
            <Link href="/" className="hover:text-primary">
              {tCat("home")}
            </Link>
          </li>
          <li className="flex items-center gap-1">
            <ChevronRight size={12} className="rtl:rotate-180" />
            <Link href="/profile" className="hover:text-primary">
              {t("breadcrumb")}
            </Link>
          </li>
        </ol>
      </nav>

      {isLoggedIn ? (
        <div className="flex flex-col gap-8 lg:flex-row">
          <ProfileSidebar />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-sm text-gray-text">
            Please log in to view your profile.
          </p>
        </div>
      )}

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}
