"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { PackageX } from "lucide-react";
import { GET_PRODUCTS } from "@/lib/graphql/queries";
import type { Product } from "@/lib/types";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

export function NewArrivals() {
  const { data, loading, error, refetch } = useQuery<{ getProducts: Product[] }>(GET_PRODUCTS);

  const latest = useMemo(() => {
    const all = [...(data?.getProducts ?? [])];
    all.sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );
    return all.slice(0, 8);
  }, [data]);

  return (
    <section aria-labelledby="arrivals-heading">
      <div className="mb-5 flex items-end justify-between">
        <h2 id="arrivals-heading" className="font-serif text-2xl font-medium text-fg">
          Just listed
        </h2>
        <Link href="/products?sort=newest" className="text-sm font-medium text-brand-text hover:underline">
          See more
        </Link>
      </div>

      {loading && <ProductGridSkeleton count={4} />}
      {error && <ErrorState error={error} title="Couldn't load products" onRetry={() => refetch()} />}
      {!loading && !error && latest.length === 0 && (
        <EmptyState
          icon={PackageX}
          title="Nothing listed yet"
          description="Sellers haven't added anything yet. Check back soon."
        />
      )}
      {!loading && !error && latest.length > 0 && <ProductGrid products={latest} />}
    </section>
  );
}
