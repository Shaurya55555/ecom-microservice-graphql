"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { GET_PRODUCT } from "@/lib/graphql/queries";
import { useAppDispatch } from "@/lib/redux/hooks";
import { addItem } from "@/lib/redux/cartSlice";
import { useSession } from "@/lib/useSession";

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

  const product = data?.getProduct;

  return (
    <div className="max-w-lg">
      <Link href="/" className="text-xs text-neutral-400 hover:text-white">
        ← Back to catalog
      </Link>

      {loading && <p className="mt-6 text-sm text-neutral-400">Loading…</p>}
      {error && <p className="mt-6 text-sm text-red-400">{error.message}</p>}
      {!loading && !error && !product && (
        <p className="mt-6 text-sm text-neutral-400">Product not found.</p>
      )}

      {product && (
        <div className="mt-6 rounded-xl border border-white/10 bg-neutral-900/60 p-6">
          <h1 className="text-lg font-semibold text-white">{product.name}</h1>
          <p className="mt-2 text-sm text-neutral-400">{product.description}</p>
          <p className="mt-5 text-2xl font-semibold text-indigo-300">
            ${product.price.toFixed(2)}
          </p>
          {!ready ? null : isBuyer ? (
            <button
              onClick={() =>
                dispatch(
                  addItem({ productId: product.id, name: product.name, price: product.price })
                )
              }
              className="mt-6 w-full rounded-md bg-indigo-500 py-2.5 text-sm font-medium text-white hover:bg-indigo-400"
            >
              Add to cart
            </button>
          ) : (
            <p className="mt-6 text-xs text-neutral-500">
              Placing orders is only available for buyer accounts.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
