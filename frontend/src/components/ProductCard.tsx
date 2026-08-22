import Link from "next/link";
import { Package, ArrowUpRight } from "lucide-react";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};

const ICON_TINTS = [
  "from-indigo-500/20 to-indigo-500/5 text-indigo-300",
  "from-emerald-500/20 to-emerald-500/5 text-emerald-300",
  "from-amber-500/20 to-amber-500/5 text-amber-300",
  "from-rose-500/20 to-rose-500/5 text-rose-300",
  "from-sky-500/20 to-sky-500/5 text-sky-300",
];

function tintFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return ICON_TINTS[hash % ICON_TINTS.length];
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative flex flex-col rounded-2xl border border-white/10 bg-neutral-900/50 p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-neutral-900 hover:shadow-lg hover:shadow-black/20"
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${tintFor(product.id)}`}>
        <Package className="h-4 w-4" strokeWidth={2} />
      </div>

      <ArrowUpRight className="absolute right-5 top-5 h-4 w-4 text-neutral-600 opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={2} />

      <h3 className="mt-3 text-sm font-medium text-white group-hover:text-indigo-300">
        {product.name}
      </h3>
      <p className="mt-1 line-clamp-2 text-xs text-neutral-400">
        {product.description}
      </p>
      <span className="mt-4 text-sm font-semibold text-white">
        ${product.price.toFixed(2)}
      </span>
    </Link>
  );
}
