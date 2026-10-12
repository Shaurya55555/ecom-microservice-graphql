"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { Heart } from "lucide-react";
import { GET_PRODUCTS } from "@/lib/graphql/queries";
import type { Product } from "@/lib/types";
import { useAppSelector } from "@/lib/redux/hooks";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/Card";
import { buttonStyles } from "@/components/ui/Button";
import { pluralize } from "@/lib/utils";

export default function WishlistPage() {
  const ids = useAppSelector((s) => s.wishlist.ids);
  const hydrated = useAppSelector((s) => s.wishlist.hydrated);
  const { data, loading, error, refetch } = useQuery<{ getProducts: Product[] }>(GET_PRODUCTS);

  // Preserve "most recently saved first" order from the store.
  const saved = useMemo(() => {
    const byId = new Map((data?.getProducts ?? []).map((p) => [p.id, p]));
    return ids.map((id) => byId.get(id)).filter((p): p is Product => !!p);
  }, [ids, data]);

  const busy = !hydrated || loading;

  return (
    <div>
      <PageHeader
        title="Wishlist"
        description={busy ? "Loading…" : pluralize(saved.length, "saved product")}
      />
      {busy && <ProductGridSkeleton count={4} />}
      {error && <ErrorState error={error} onRetry={() => refetch()} />}
      {!busy && !error && saved.length === 0 && (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Tap the heart on any product to keep it here for later."
          action={
            <Link href="/products" className={buttonStyles({})}>
              Browse products
            </Link>
          }
        />
      )}
      {!busy && !error && saved.length > 0 && <ProductGrid products={saved} />}
    </div>
  );
}
