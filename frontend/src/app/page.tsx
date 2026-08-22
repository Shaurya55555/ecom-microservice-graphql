"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_PRODUCTS } from "@/lib/graphql/queries";
import { ProductCard } from "@/components/ProductCard";

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
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Product Catalog</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Live from <code className="text-neutral-300">getProducts</code> on the GraphQL gateway.
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-56 rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-indigo-400/50 focus:outline-none"
        />
      </div>

      {loading && <p className="text-sm text-neutral-400">Loading products…</p>}
      {error && (
        <p className="text-sm text-red-400">
          Could not reach the GraphQL gateway ({error.message}). Is it running at{" "}
          <code>{process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:4000/"}</code>?
        </p>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-sm text-neutral-400">No products match &ldquo;{search}&rdquo;.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
