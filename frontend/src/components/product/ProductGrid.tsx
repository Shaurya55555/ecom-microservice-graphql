import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid animate-fade-in grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
