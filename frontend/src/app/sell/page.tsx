"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { CREATE_PRODUCT, RESPOND_TO_ORDER } from "@/lib/graphql/mutations";
import { GET_PRODUCTS, GET_SELLER_ORDERS } from "@/lib/graphql/queries";
import { useSession } from "@/lib/useSession";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  sellerId: string | null;
};

type Order = {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  status: string;
};

const statusColor: Record<string, string> = {
  Pending: "text-amber-400",
  Accepted: "text-emerald-400",
  Rejected: "text-red-400",
};

export default function SellPage() {
  const { session, ready } = useSession();
  const isSeller = !!session && session.role === "seller";

  const productsQuery = useQuery<{ getProducts: Product[] }>(GET_PRODUCTS, { skip: !isSeller });
  const ordersQuery = useQuery<{ getSellerOrders: Order[] }>(GET_SELLER_ORDERS, {
    skip: !isSeller,
    pollInterval: isSeller ? 5000 : undefined,
  });
  const [createProduct, { loading: creating, error: createError }] = useMutation(CREATE_PRODUCT);
  const [respond, { loading: responding }] = useMutation(RESPOND_TO_ORDER);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [justAdded, setJustAdded] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);

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

  if (!isSeller) {
    return (
      <p className="text-sm text-neutral-400">
        This dashboard is for seller accounts. You&apos;re signed in as a{" "}
        <span className="text-white">{session.role}</span>.
      </p>
    );
  }

  const myProducts = (productsQuery.data?.getProducts ?? []).filter(
    (p) => p.sellerId === session.userId
  );
  const productName = (id: string) =>
    productsQuery.data?.getProducts.find((p) => p.id === id)?.name ?? id.slice(-6);

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
    productsQuery.refetch();
  }

  async function handleRespond(id: string, accept: boolean) {
    setRespondingId(id);
    await respond({ variables: { id, accept } });
    ordersQuery.refetch();
    setRespondingId(null);
  }

  const pendingOrders = (ordersQuery.data?.getSellerOrders ?? []).filter(
    (o) => o.status === "Pending"
  );
  const pastOrders = (ordersQuery.data?.getSellerOrders ?? []).filter(
    (o) => o.status !== "Pending"
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold text-white">Seller dashboard</h1>
      <p className="mt-1 text-sm text-neutral-400">{session.username}</p>

      <h2 className="mt-8 text-sm font-medium text-white">
        Order requests {ordersQuery.data ? `(${pendingOrders.length} pending)` : ""}
      </h2>
      <p className="mt-1 text-xs text-neutral-500">
        Buyer requests against your products. Refreshes every 5s.
      </p>

      {ordersQuery.loading && <p className="mt-4 text-sm text-neutral-400">Loading…</p>}
      {ordersQuery.error && <p className="mt-4 text-sm text-red-400">{ordersQuery.error.message}</p>}

      <div className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 bg-neutral-900/60">
        {pendingOrders.length === 0 && (
          <p className="px-5 py-4 text-sm text-neutral-400">No pending requests.</p>
        )}
        {pendingOrders.map((o) => (
          <div key={o.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm text-white">{productName(o.productId)}</p>
              <p className="text-xs text-neutral-400">Qty {o.quantity} · Request #{o.id.slice(-6)}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleRespond(o.id, true)}
                disabled={responding && respondingId === o.id}
                className="rounded-md bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
              >
                Accept
              </button>
              <button
                onClick={() => handleRespond(o.id, false)}
                disabled={responding && respondingId === o.id}
                className="rounded-md bg-red-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {pastOrders.map((o) => (
          <div key={o.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm text-white">{productName(o.productId)}</p>
              <p className="text-xs text-neutral-400">Qty {o.quantity} · Request #{o.id.slice(-6)}</p>
            </div>
            <span className={`text-xs font-medium ${statusColor[o.status] ?? "text-neutral-400"}`}>
              {o.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-white/10 bg-neutral-900/60 p-6">
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

      <h2 className="mt-8 text-sm font-medium text-white">Your products</h2>

      {productsQuery.loading && <p className="mt-4 text-sm text-neutral-400">Loading…</p>}
      {productsQuery.error && (
        <p className="mt-4 text-sm text-red-400">{productsQuery.error.message}</p>
      )}

      <div className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 bg-neutral-900/60">
        {myProducts.length === 0 && (
          <p className="px-5 py-4 text-sm text-neutral-400">You haven&apos;t listed anything yet.</p>
        )}
        {myProducts.map((p) => (
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
