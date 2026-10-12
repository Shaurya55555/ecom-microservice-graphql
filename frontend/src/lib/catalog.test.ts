import { describe, expect, it } from "vitest";
import {
  DEFAULT_FILTERS,
  applyFilters,
  categoryCounts,
  countActiveFilters,
  filtersToParams,
  paginate,
  parseFilters,
  parsePage,
} from "./catalog";
import type { Product } from "./types";

const p = (over: Partial<Product>): Product => ({
  id: over.name ?? "x",
  name: "Item",
  description: "A thing",
  price: 10,
  category: "General",
  createdAt: "2026-01-01T00:00:00.000Z",
  ...over,
});

const catalog: Product[] = [
  p({ name: "Aurora Headphones", category: "Electronics", price: 130, createdAt: "2026-03-01T00:00:00Z" }),
  p({ name: "Pulse Keyboard", category: "Electronics", price: 89, description: "Mechanical", createdAt: "2026-02-01T00:00:00Z" }),
  p({ name: "Linen Shirt", category: "Fashion", price: 58, createdAt: "2026-01-01T00:00:00Z" }),
  p({ name: "Mystery Box", category: null, price: 15 }),
];

describe("applyFilters", () => {
  it("searches name, description and category case-insensitively", () => {
    expect(applyFilters(catalog, { ...DEFAULT_FILTERS, q: "mechanical" }).map((x) => x.name)).toEqual(["Pulse Keyboard"]);
    expect(applyFilters(catalog, { ...DEFAULT_FILTERS, q: "FASHION" }).map((x) => x.name)).toEqual(["Linen Shirt"]);
  });

  it("filters by category, treating a missing category as General", () => {
    expect(applyFilters(catalog, { ...DEFAULT_FILTERS, category: "electronics" })).toHaveLength(2);
    expect(applyFilters(catalog, { ...DEFAULT_FILTERS, category: "General" }).map((x) => x.name)).toEqual(["Mystery Box"]);
  });

  it("filters by inclusive price range", () => {
    const names = applyFilters(catalog, { ...DEFAULT_FILTERS, min: 58, max: 89 }).map((x) => x.name);
    expect(names.sort()).toEqual(["Linen Shirt", "Pulse Keyboard"]);
  });

  it("sorts by price, name and newest without mutating the input", () => {
    const before = catalog.map((x) => x.name);
    expect(applyFilters(catalog, { ...DEFAULT_FILTERS, sort: "price-asc" }).map((x) => x.price)).toEqual([15, 58, 89, 130]);
    expect(applyFilters(catalog, { ...DEFAULT_FILTERS, sort: "price-desc" })[0].price).toBe(130);
    expect(applyFilters(catalog, { ...DEFAULT_FILTERS, sort: "name" })[0].name).toBe("Aurora Headphones");
    expect(applyFilters(catalog, { ...DEFAULT_FILTERS, sort: "newest" })[0].name).toBe("Aurora Headphones");
    expect(catalog.map((x) => x.name)).toEqual(before);
  });
});

describe("URL <-> filters", () => {
  it("round-trips non-default filters", () => {
    const filters = { q: "desk", category: "Home", min: 10, max: 99, sort: "price-asc" as const };
    const params = filtersToParams(filters, 3);
    expect(parseFilters(params)).toEqual(filters);
    expect(parsePage(params)).toBe(3);
  });

  it("omits defaults so URLs stay clean", () => {
    expect(filtersToParams(DEFAULT_FILTERS).toString()).toBe("");
  });

  it("is defensive about hostile or garbage input", () => {
    const f = parseFilters(new URLSearchParams("sort=__proto__&min=abc&max=-5&q=%20%20x%20"));
    expect(f.sort).toBe("featured");
    expect(f.min).toBeNull();
    expect(f.max).toBeNull();
    expect(f.q).toBe("x");
    expect(parsePage(new URLSearchParams("page=-2"))).toBe(1);
    expect(parsePage(new URLSearchParams("page=abc"))).toBe(1);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, i) => i);
  it("slices pages and reports totals", () => {
    const r = paginate(items, 2, 10);
    expect(r.items).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    expect(r.totalPages).toBe(3);
  });
  it("clamps out-of-range pages", () => {
    expect(paginate(items, 99, 10).page).toBe(3);
    expect(paginate(items, 0, 10).page).toBe(1);
  });
  it("handles empty lists", () => {
    expect(paginate([], 1)).toEqual({ page: 1, totalPages: 1, items: [] });
  });
});

describe("helpers", () => {
  it("counts active filters (sort doesn't count)", () => {
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0);
    expect(countActiveFilters({ ...DEFAULT_FILTERS, q: "a", min: 0, sort: "name" })).toBe(2);
  });
  it("counts products per category", () => {
    expect(categoryCounts(catalog)).toEqual({ Electronics: 2, Fashion: 1, General: 1 });
  });
});
