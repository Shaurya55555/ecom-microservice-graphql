import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductsBrowser } from "@/components/catalog/ProductsBrowser";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse every product from independent sellers. Filter by category and price, sort, and search.",
};

export default function ProductsPage() {
  // useSearchParams() needs a Suspense boundary so the rest of the page can prerender.
  return (
    <Suspense fallback={<ProductGridSkeleton count={8} />}>
      <ProductsBrowser />
    </Suspense>
  );
}
