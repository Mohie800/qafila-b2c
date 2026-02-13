export interface Brand {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  isActive: boolean;
  logo?: string | null;
}

export interface Color {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  isActive: boolean;
  hexCode?: string | null;
}

export interface Size {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  isActive: boolean;
  sortOrder?: number;
}

export interface Material {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  isActive: boolean;
}

export interface Pattern {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  isActive: boolean;
}

export interface PriceRange {
  id: string;
  label: string;
  labelAr: string;
  min: number;
  max: number;
  isActive: boolean;
}

export interface CategoryFilters {
  brandId?: string[];
  colorId?: string[];
  sizeId?: string[];
  materialId?: string[];
  patternId?: string[];
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface FilterOptions {
  brands: Brand[];
  colors: Color[];
  sizes: Size[];
  materials: Material[];
  patterns: Pattern[];
  priceRanges: PriceRange[];
  subcategories: { id: string; name: string; nameAr: string; slug: string }[];
}
