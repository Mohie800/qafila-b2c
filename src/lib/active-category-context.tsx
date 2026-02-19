"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Category } from "@/types/category";

interface ActiveCategoryContextValue {
  activeRootSlug: string;
  setActiveRootSlug: (slug: string) => void;
  categoryTree: Category[];
}

const ActiveCategoryContext = createContext<ActiveCategoryContextValue>({
  activeRootSlug: "",
  setActiveRootSlug: () => {},
  categoryTree: [],
});

export function ActiveCategoryProvider({
  initialSlug,
  categoryTree,
  children,
}: {
  initialSlug: string;
  categoryTree: Category[];
  children: ReactNode;
}) {
  const [activeRootSlug, setActiveRootSlug] = useState(initialSlug);

  return (
    <ActiveCategoryContext.Provider
      value={{ activeRootSlug, setActiveRootSlug, categoryTree }}
    >
      {children}
    </ActiveCategoryContext.Provider>
  );
}

export function useActiveCategory() {
  return useContext(ActiveCategoryContext);
}
