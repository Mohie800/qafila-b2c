"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Category } from "@/types/category";
import { resolveImage, getCategoryName } from "@/lib/category-helpers";
import Image from "next/image";

interface MegaMenuProps {
  categoryTree: Category[];
  activeRootSlug: string;
  locale: string;
  onClose: () => void;
}

export default function MegaMenu({
  categoryTree,
  activeRootSlug,
  locale,
  onClose,
}: MegaMenuProps) {
  const t = useTranslations("megaMenu");

  // Find the active root category
  const activeRoot = categoryTree.find((cat) => cat.slug === activeRootSlug);
  const sidebarItems = activeRoot?.children ?? [];

  // Default to first sidebar item
  const [hoveredSidebarId, setHoveredSidebarId] = useState<string | null>(
    sidebarItems[0]?.id ?? null,
  );

  // Reset hovered sidebar when root changes
  useEffect(() => {
    setHoveredSidebarId(sidebarItems[0]?.id ?? null);
  }, [activeRootSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleLinkClick = useCallback(() => {
    onClose();
  }, [onClose]);

  // Get the hovered sidebar category
  const hoveredSidebar = sidebarItems.find((c) => c.id === hoveredSidebarId);
  const gridChildren = hoveredSidebar?.children ?? [];

  // Check if grid children have their own children (column layout vs flat grid)
  const hasSubChildren = gridChildren.some(
    (c) => c.children && c.children.length > 0,
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu */}
      <div className="absolute start-0 top-full z-50 hidden w-full animate-[megaMenuSlideDown_0.2s_ease-out] border-b border-gray-border bg-white shadow-lg md:block">
        <div className="mx-auto flex max-h-[480px] max-w-360">
          {/* Sidebar */}
          <div className="w-[220px] flex-shrink-0 overflow-y-auto border-e border-gray-border bg-gray-light">
            {sidebarItems.length > 0 ? (
              sidebarItems.map((item) => {
                const isActive = item.id === hoveredSidebarId;
                const imgSrc = resolveImage(item.image);
                const name = getCategoryName(item, locale);

                return (
                  <Link
                    key={item.id}
                    href={`/categories/${item.slug}`}
                    onClick={handleLinkClick}
                    onMouseEnter={() => setHoveredSidebarId(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? "bg-white font-medium text-dark"
                        : "text-gray-text hover:bg-white/60"
                    }`}
                  >
                    {/* Circular thumbnail */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-border">
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-gray-text">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span>{name}</span>
                  </Link>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-text">
                —
              </div>
            )}
          </div>

          {/* Grid area */}
          <div className="flex-1 overflow-y-auto p-6">
            {gridChildren.length === 0 ? (
              // No children - show View All
              hoveredSidebar && (
                <Link
                  href={`/categories/${hoveredSidebar.slug}`}
                  onClick={handleLinkClick}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t("viewAll")} {getCategoryName(hoveredSidebar, locale)}
                </Link>
              )
            ) : hasSubChildren ? (
              // Column layout: headers + sub-items
              <div className="grid grid-cols-3 gap-x-8 gap-y-6 xl:grid-cols-4">
                {gridChildren.map((col) => (
                  <div key={col.id}>
                    <Link
                      href={`/categories/${col.slug}`}
                      onClick={handleLinkClick}
                      className="mb-3 block text-sm font-bold uppercase text-dark hover:text-primary"
                    >
                      {getCategoryName(col, locale)}
                    </Link>
                    <ul className="space-y-2">
                      {(col.children ?? []).map((leaf) => {
                        const leafImg = resolveImage(leaf.image);
                        return (
                          <li key={leaf.id}>
                            <Link
                              href={`/categories/${leaf.slug}`}
                              onClick={handleLinkClick}
                              className="flex items-center gap-2 text-sm text-gray-text transition-colors hover:text-dark"
                            >
                              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-gray-light">
                                {leafImg ? (
                                  <Image
                                    src={leafImg}
                                    alt={getCategoryName(leaf, locale)}
                                    width={28}
                                    height={28}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gray-border" />
                                )}
                              </div>
                              <span>{getCategoryName(leaf, locale)}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              // Flat grid: items with thumbnails
              <div className="grid grid-cols-3 gap-4 xl:grid-cols-4">
                {gridChildren.map((item) => {
                  const itemImg = resolveImage(item.image);
                  return (
                    <Link
                      key={item.id}
                      href={`/categories/${item.slug}`}
                      onClick={handleLinkClick}
                      className="flex items-center gap-2 rounded p-2 text-sm text-gray-text transition-colors hover:bg-gray-light hover:text-dark"
                    >
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-gray-light">
                        {itemImg ? (
                          <Image
                            src={itemImg}
                            alt={getCategoryName(item, locale)}
                            width={28}
                            height={28}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-border" />
                        )}
                      </div>
                      <span>{getCategoryName(item, locale)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
