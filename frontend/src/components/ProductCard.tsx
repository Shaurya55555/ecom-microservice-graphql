import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col rounded-xl border border-white/10 bg-neutral-900/60 p-5 transition hover:border-indigo-400/40 hover:bg-neutral-900"
    >
      <h3 className="text-sm font-medium text-white group-hover:text-indigo-300">
        {product.name}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-xs text-neutral-400">
        {product.description}
      </p>
      <span className="mt-4 text-sm font-semibold text-indigo-300">
        ${product.price.toFixed(2)}
      </span>
    </Link>
  );
}
