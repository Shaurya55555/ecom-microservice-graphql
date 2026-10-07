"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { PackageX, Search, SlidersHorizontal, X } from "lucide-react";
import { GET_PRODUCTS } from "@/lib/graphql/queries";
import type { Product } from "@/lib/types";
import {
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  applyFilters,
  categoryCounts,
  countActiveFilters,
  filtersToParams,
  paginate,
  parseFilters,
  parsePage,
  type CatalogFilters,
} from "@/lib/catalog";
import { CATEGORIES } from "@/lib/categories";
import { useDebounce } from "@/lib/useDebounce";
import { cn, pluralize } from "@/lib/utils";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { PageHeader } from "@/components/ui/Card";
import { controlClass } from "@/components/ui/Field";

export function ProductsBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, loading, error, refetch } = useQuery<{ getProducts: Product[] }>(GET_PRODUCTS);

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const page = parsePage(searchParams);

  // The search box is controlled locally and debounced into the URL.
  const [search, setSearch] = useState(filters.q);
  const debouncedSearch = useDebounce(search, 300);
  // Last query this component wrote to the URL, so URL->input syncing can tell
  // "our own update" apart from an external change (header search, back button).
  const pushedQuery = useRef(filters.q);
  const [filtersOpen, setFiltersOpen] = useState(false);

  function navigate(next: CatalogFilters, nextPage = 1) {
    const qs = filtersToParams(next, nextPage).toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Push the debounced query into the URL (and reset to page 1).
  useEffect(() => {
    const next = debouncedSearch.trim();
    if (next !== filters.q) {
      pushedQuery.current = next;
      navigate({ ...filters, q: next });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Keep the inputs in step when the URL changes from outside (header search, back button, "clear").
  useEffect(() => {
    if (filters.q !== pushedQuery.current) {
      pushedQuery.current = filters.q;
      setSearch(filters.q);
    }
  }, [filters.q]);

  const all = useMemo(() => data?.getProducts ?? [], [data]);
  const counts = useMemo(() => categoryCounts(all), [all]);
  const filtered = useMemo(() => applyFilters(all, filters), [all, filters]);
  const paged = paginate(filtered, page);
  const activeCount = countActiveFilters(filters);

  const maxPriceInCatalog = useMemo(
    () => (all.length ? Math.ceil(Math.max(...all.map((p) => p.price))) : 0),
    [all]
  );

  const sidebar = (
    <div className="space-y-8">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-subtle">Category</h2>
        <ul className="mt-3 space-y-1">
          <li>
            <button
              type="button"
              onClick={() => navigate({ ...filters, category: "" })}
              aria-pressed={filters.category === ""}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                filters.category === "" ? "bg-brand-soft font-medium text-brand-text" : "text-muted hover:bg-surface-2 hover:text-fg"
              )}
            >
              All products
              <span className="text-xs tabular-nums text-subtle">{all.length}</span>
            </button>
          </li>
          {CATEGORIES.map((c) => {
            const n = counts[c.name] ?? 0;
            const active = filters.category.toLowerCase() === c.name.toLowerCase();
            return (
              <li key={c.name}>
                <button
                  type="button"
                  onClick={() => navigate({ ...filters, category: active ? "" : c.name })}
                  aria-pressed={active}
                  disabled={n === 0 && !active}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-40",
                    active ? "bg-brand-soft font-medium text-brand-text" : "text-muted hover:bg-surface-2 hover:text-fg"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <c.icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                    {c.name}
                  </span>
                  <span className="text-xs tabular-nums text-subtle">{n}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <PriceFilter
        // Remount when the URL's price changes (clear chip, back button) so the inputs reset.
        key={`${filters.min}-${filters.max}`}
        min={filters.min}
        max={filters.max}
        placeholderMax={maxPriceInCatalog}
        onApply={(min, max) => navigate({ ...filters, min, max })}
      />
    </div>
  );

  return (
    <div>
      <PageHeader
        title={filters.category || "All products"}
        description={
          loading ? "Loading…" : `${pluralize(filtered.length, "product")}${filters.q ? ` for “${filters.q}”` : ""}`
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, description or category…"
            aria-label="Search products"
            className={controlClass(false, "h-10 pl-9")}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="lg:hidden"
            onClick={() => setFiltersOpen(true)}
            aria-haspopup="dialog"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={2} aria-hidden />
            Filters{activeCount > 0 && ` (${activeCount})`}
          </Button>
          <select
            aria-label="Sort products"
            value={filters.sort}
            onChange={(e) => navigate({ ...filters, sort: e.target.value as CatalogFilters["sort"] })}
            className={controlClass(false, "h-10 w-auto min-w-44")}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeCount > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2" aria-label="Active filters">
          {filters.q && <FilterChip label={`“${filters.q}”`} onRemove={() => navigate({ ...filters, q: "" })} />}
          {filters.category && (
            <FilterChip label={filters.category} onRemove={() => navigate({ ...filters, category: "" })} />
          )}
          {filters.min !== null && (
            <FilterChip label={`Min $${filters.min}`} onRemove={() => navigate({ ...filters, min: null })} />
          )}
          {filters.max !== null && (
            <FilterChip label={`Max $${filters.max}`} onRemove={() => navigate({ ...filters, max: null })} />
          )}
          <button
            type="button"
            onClick={() => navigate({ ...DEFAULT_FILTERS, sort: filters.sort })}
            className="text-xs font-medium text-brand-text hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Wide screens: a sticky sidebar. Phones get the same controls in a bottom sheet (below). */}
        <aside aria-label="Filters" className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          {sidebar}
        </aside>

        <div>
          {loading && <ProductGridSkeleton count={8} />}
          {error && <ErrorState error={error} title="Couldn't load products" onRetry={() => refetch()} />}

          {!loading && !error && filtered.length === 0 && (
            <EmptyState
              icon={PackageX}
              title={activeCount ? "No products match your filters" : "No products yet"}
              description={activeCount ? "Try removing a filter or searching for something else." : "Check back soon."}
              action={
                activeCount > 0 ? (
                  <Button variant="secondary" onClick={() => navigate(DEFAULT_FILTERS)}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          )}

          {!loading && !error && filtered.length > 0 && (
            <>
              <ProductGrid products={paged.items} />
              <Pagination
                page={paged.page}
                totalPages={paged.totalPages}
                onChange={(p) => {
                  navigate(filters, p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          )}
        </div>
      </div>

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        side="bottom"
        title="Filters"
        footer={
          <Button className="w-full" size="lg" onClick={() => setFiltersOpen(false)}>
            Show {pluralize(filtered.length, "product")}
          </Button>
        }
      >
        {/* Mounted only while open so the price inputs never exist twice in the page. */}
        {filtersOpen && <div className="p-5">{sidebar}</div>}
      </Sheet>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft py-1 pl-3 pr-1.5 text-xs font-medium text-brand-text">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
        className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-brand/20"
      >
        <X className="h-3 w-3" strokeWidth={2.5} aria-hidden />
      </button>
    </span>
  );
}

function PriceFilter({
  min,
  max,
  placeholderMax,
  onApply,
}: {
  min: number | null;
  max: number | null;
  placeholderMax: number;
  onApply: (min: number | null, max: number | null) => void;
}) {
  const [minText, setMinText] = useState(min?.toString() ?? "");
  const [maxText, setMaxText] = useState(max?.toString() ?? "");

  const parse = (v: string) => {
    if (v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onApply(parse(minText), parse(maxText));
      }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-subtle">Price</h2>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="number"
          min={0}
          inputMode="decimal"
          value={minText}
          onChange={(e) => setMinText(e.target.value)}
          placeholder="Min"
          aria-label="Minimum price"
          className={controlClass(false, "px-2.5")}
        />
        <span className="text-subtle" aria-hidden>
          –
        </span>
        <input
          type="number"
          min={0}
          inputMode="decimal"
          value={maxText}
          onChange={(e) => setMaxText(e.target.value)}
          placeholder={placeholderMax ? String(placeholderMax) : "Max"}
          aria-label="Maximum price"
          className={controlClass(false, "px-2.5")}
        />
      </div>
      <Button type="submit" variant="secondary" size="sm" className="mt-3 w-full">
        Apply price
      </Button>
    </form>
  );
}
