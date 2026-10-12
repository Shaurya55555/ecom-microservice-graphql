"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_PRODUCTS } from "@/lib/graphql/queries";
import { useRecentlyViewed } from "@/lib/recent";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

/**
 * A swipeable row of products the shopper looked at recently. Renders nothing for a first-time
 * visitor, so it never leaves an empty heading behind.
 */
export function RecentlyViewed({
  title = "Recently viewed",
  excludeId,
}: {
  title?: string;
  excludeId?: string;
}) {
  const { ids } = useRecentlyViewed();
  const wanted = useMemo(() => ids.filter((id) => id !== excludeId).slice(0, 6), [ids, excludeId]);
  const { data } = useQuery<{ getProducts: Product[] }>(GET_PRODUCTS, { skip: wanted.length === 0 });

  const products = useMemo(() => {
    const byId = new Map((data?.getProducts ?? []).map((p) => [p.id, p]));
    return wanted.map((id) => byId.get(id)).filter((p): p is Product => !!p);
  }, [wanted, data]);

  if (products.length === 0) return null;

  return (
    <section aria-labelledby="recent-heading">
      <h2 id="recent-heading" className="mb-5 font-serif text-2xl font-medium text-fg">
        {title}
      </h2>
      {/* Scroll-snap row: swipe on touch, scroll or drag on desktop. Bleeds to the screen edge on phones. */}
      <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none] lg:grid lg:grid-cols-4 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
        {products.map((p) => (
          <li key={p.id} className="w-44 shrink-0 snap-start sm:w-52 lg:w-auto">
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
