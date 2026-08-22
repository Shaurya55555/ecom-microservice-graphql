"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Search, PackageX, AlertTriangle } from "lucide-react";
import { GET_PRODUCTS } from "@/lib/graphql/queries";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export default function CatalogPage() {
  const { data, loading, error } = useQuery<{ getProducts: Product[] }>(GET_PRODUCTS);
  const [search, setSearch] = useState("");

  const products = useMemo(() => {
    const all = data?.getProducts ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [data, search]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Product Catalog</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Live from <code className="rounded bg-white/5 px-1 py-0.5 text-neutral-300">getProducts</code> on the GraphQL gateway.
          </p>
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" strokeWidth={2} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-lg border border-white/10 bg-neutral-900 py-2 pl-9 pr-3 text-sm text-white placeholder:text-neutral-500 transition-colors focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5 text-sm text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <p>
            Could not reach the GraphQL gateway ({error.message}). Is it running at{" "}
            <code className="text-red-200">{process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:4000/"}</code>?
          </p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <EmptyState
          icon={PackageX}
          title={search ? `No products match "${search}"` : "No products yet"}
          description={search ? "Try a different search term." : undefined}
        />
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid animate-fade-in grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
