import type { Product } from "./types";

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A–Z" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export const PAGE_SIZE = 12;

export type CatalogFilters = {
  q: string;
  category: string;
  min: number | null;
  max: number | null;
  sort: SortKey;
};

export const DEFAULT_FILTERS: CatalogFilters = {
  q: "",
  category: "",
  min: null,
  max: null,
  sort: "featured",
};

function toNumber(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Parses URLSearchParams defensively — the URL is user-editable input. */
export function parseFilters(params: URLSearchParams): CatalogFilters {
  const sort = params.get("sort");
  return {
    q: params.get("q")?.trim() ?? "",
    category: params.get("category") ?? "",
    min: toNumber(params.get("min")),
    max: toNumber(params.get("max")),
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? (sort as SortKey) : "featured",
  };
}

/** Inverse of parseFilters; omits defaults so URLs stay clean. */
export function filtersToParams(filters: CatalogFilters, page = 1): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.q) p.set("q", filters.q);
  if (filters.category) p.set("category", filters.category);
  if (filters.min !== null) p.set("min", String(filters.min));
  if (filters.max !== null) p.set("max", String(filters.max));
  if (filters.sort !== "featured") p.set("sort", filters.sort);
  if (page > 1) p.set("page", String(page));
  return p;
}

export function parsePage(params: URLSearchParams): number {
  const n = Math.floor(Number(params.get("page")));
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export function applyFilters(products: Product[], f: CatalogFilters): Product[] {
  const q = f.q.toLowerCase();
  const result = products.filter((p) => {
    if (q && !`${p.name} ${p.description} ${p.category ?? ""}`.toLowerCase().includes(q)) return false;
    if (f.category && (p.category ?? "General").toLowerCase() !== f.category.toLowerCase()) return false;
    if (f.min !== null && p.price < f.min) return false;
    if (f.max !== null && p.price > f.max) return false;
    return true;
  });

  const time = (p: Product) => new Date(p.createdAt ?? 0).getTime() || 0;
  switch (f.sort) {
    case "newest":
      result.sort((a, b) => time(b) - time(a));
      break;
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "name":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }
  return result;
}

export function paginate<T>(items: T[], page: number, size = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(page, 1), totalPages);
  return {
    page: current,
    totalPages,
    items: items.slice((current - 1) * size, current * size),
  };
}

export function countActiveFilters(f: CatalogFilters) {
  return [f.q, f.category, f.min, f.max].filter((v) => v !== "" && v !== null).length;
}

/** Category → product count, for the filter sidebar. */
export function categoryCounts(products: Product[]): Record<string, number> {
  return products.reduce<Record<string, number>>((acc, p) => {
    const key = p.category || "General";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}
