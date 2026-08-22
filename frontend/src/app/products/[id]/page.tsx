"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { ArrowLeft, Package, ShoppingCart, Check, Info } from "lucide-react";
import { GET_PRODUCT } from "@/lib/graphql/queries";
import { useAppDispatch } from "@/lib/redux/hooks";
import { addItem } from "@/lib/redux/cartSlice";
import { useSession } from "@/lib/useSession";
import { Skeleton } from "@/components/ui/Skeleton";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, loading, error } = useQuery<{ getProduct: Product | null }>(GET_PRODUCT, {
    variables: { id },
  });
  const dispatch = useAppDispatch();
  const { session, ready } = useSession();
  const isBuyer = !session || session.role === "user";
  const [added, setAdded] = useState(false);

  const product = data?.getProduct;

  return (
    <div className="max-w-lg">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Back to catalog
      </Link>

      {loading && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-neutral-900/50 p-6">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="mt-4 h-5 w-2/3" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-1.5 h-3 w-3/4" />
          <Skeleton className="mt-5 h-8 w-24" />
        </div>
      )}
      {error && (
        <p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          {error.message}
        </p>
      )}
      {!loading && !error && !product && (
        <p className="mt-6 text-sm text-neutral-400">Product not found.</p>
      )}

      {product && (
        <div className="mt-6 animate-fade-in rounded-2xl border border-white/10 bg-neutral-900/50 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 text-indigo-300">
            <Package className="h-5 w-5" strokeWidth={2} />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-white">{product.name}</h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-400">{product.description}</p>
          <p className="mt-5 text-2xl font-semibold text-white">
            ${product.price.toFixed(2)}
          </p>
          {!ready ? null : isBuyer ? (
            <button
              onClick={() => {
                dispatch(
                  addItem({ productId: product.id, name: product.name, price: product.price })
                );
                setAdded(true);
                setTimeout(() => setAdded(false), 1500);
              }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/30 transition-colors hover:bg-indigo-400"
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                  Added to cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" strokeWidth={2} />
                  Add to cart
                </>
              )}
            </button>
          ) : (
            <p className="mt-6 flex items-center gap-1.5 text-xs text-neutral-500">
              <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              Placing orders is only available for buyer accounts.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
