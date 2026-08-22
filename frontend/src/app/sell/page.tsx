"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { CREATE_PRODUCT } from "@/lib/graphql/mutations";
import { GET_PRODUCTS } from "@/lib/graphql/queries";
import { useSession } from "@/lib/useSession";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export default function SellPage() {
  const { session, ready } = useSession();
  const { data, loading, error, refetch } = useQuery<{ getProducts: Product[] }>(GET_PRODUCTS, {
    skip: !session || session.role !== "seller",
  });
  const [createProduct, { loading: creating, error: createError }] = useMutation(CREATE_PRODUCT);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  if (!ready) return null;

  if (!session) {
    return (
      <p className="text-sm text-neutral-400">
        <Link href="/login" className="text-indigo-300 hover:underline">
          Log in
        </Link>{" "}
        to access the seller dashboard.
      </p>
    );
  }

  if (session.role !== "seller") {
    return (
      <p className="text-sm text-neutral-400">
        This dashboard is for seller accounts. You&apos;re signed in as a{" "}
        <span className="text-white">{session.role}</span>.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    if (!name || !description || isNaN(parsedPrice)) return;
    await createProduct({ variables: { name, description, price: parsedPrice } });
    setName("");
    setDescription("");
    setPrice("");
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
    refetch();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold text-white">Seller dashboard</h1>
      <p className="mt-1 text-sm text-neutral-400">{session.username}</p>

      <div className="mt-6 rounded-xl border border-white/10 bg-neutral-900/60 p-6">
        <h2 className="text-sm font-medium text-white">List a new product</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs text-neutral-400">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-indigo-400/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-neutral-400">Description</label>
            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-indigo-400/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-neutral-400">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-indigo-400/50 focus:outline-none"
            />
          </div>

          {createError && <p className="text-xs text-red-400">{createError.message}</p>}
          {justAdded && <p className="text-xs text-emerald-400">Product listed.</p>}

          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-md bg-indigo-500 py-2.5 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
          >
            {creating ? "Listing…" : "List product"}
          </button>
        </form>
      </div>

      <h2 className="mt-8 text-sm font-medium text-white">All products</h2>
      <p className="mt-1 text-xs text-neutral-500">
        The schema has no product-owner field, so this shows the full catalog, not just
        products you listed.
      </p>

      {loading && <p className="mt-4 text-sm text-neutral-400">Loading…</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error.message}</p>}

      <div className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 bg-neutral-900/60">
        {(data?.getProducts ?? []).map((p) => (
          <div key={p.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm text-white">{p.name}</p>
              <p className="text-xs text-neutral-400">{p.description}</p>
            </div>
            <span className="text-sm font-medium text-indigo-300">${p.price.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
