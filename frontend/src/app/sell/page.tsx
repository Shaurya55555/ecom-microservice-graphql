"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Store,
  Check,
  X,
  PackagePlus,
  Package,
  Inbox,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { CREATE_PRODUCT, RESPOND_TO_ORDER } from "@/lib/graphql/mutations";
import { GET_PRODUCTS, GET_SELLER_ORDERS } from "@/lib/graphql/queries";
import { useSession } from "@/lib/useSession";
import { Card, CardRow, SectionHeading } from "@/components/ui/Card";
import { CardRowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge, STATUS_VARIANT } from "@/components/ui/Badge";

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
        <Link href="/login" className="font-medium text-indigo-300 hover:underline">
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
    <div className="max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
          <Store className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Seller dashboard</h1>
          <p className="text-sm text-neutral-400">{session.username}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs text-neutral-500">Pending requests</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {ordersQuery.data ? pendingOrders.length : "—"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-neutral-500">Your products</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {productsQuery.data ? myProducts.length : "—"}
          </p>
        </Card>
      </div>

      <div className="mt-8">
        <SectionHeading
          title="Order requests"
          hint="Refreshes every 5s"
        />

        {ordersQuery.loading && (
          <Card className="divide-y divide-white/10">
            <CardRowSkeleton />
          </Card>
        )}
        {ordersQuery.error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
            {ordersQuery.error.message}
          </div>
        )}

        {!ordersQuery.loading && !ordersQuery.error && (
          <Card className="divide-y divide-white/10">
            {pendingOrders.length === 0 && pastOrders.length === 0 && (
              <EmptyState icon={Inbox} title="No requests yet" description="Buyer requests against your products will land here." />
            )}
            {pendingOrders.map((o) => (
              <CardRow key={o.id}>
                <div>
                  <p className="text-sm text-white">{productName(o.productId)}</p>
                  <p className="text-xs text-neutral-400">Qty {o.quantity} · Request #{o.id.slice(-6)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(o.id, true)}
                    disabled={responding && respondingId === o.id}
                    className="flex items-center gap-1 rounded-md bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {responding && respondingId === o.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2.5} />
                    ) : (
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    )}
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(o.id, false)}
                    disabled={responding && respondingId === o.id}
                    className="flex items-center gap-1 rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-red-500/90 hover:text-white disabled:opacity-60"
                  >
                    <X className="h-3 w-3" strokeWidth={2.5} />
                    Reject
                  </button>
                </div>
              </CardRow>
            ))}
            {pastOrders.map((o) => (
              <CardRow key={o.id}>
                <div>
                  <p className="text-sm text-white">{productName(o.productId)}</p>
                  <p className="text-xs text-neutral-400">Qty {o.quantity} · Request #{o.id.slice(-6)}</p>
                </div>
                <Badge variant={STATUS_VARIANT[o.status] ?? "neutral"}>{o.status}</Badge>
              </CardRow>
            ))}
          </Card>
        )}
      </div>

      <Card className="mt-8 p-6">
        <div className="flex items-center gap-2">
          <PackagePlus className="h-4 w-4 text-neutral-400" strokeWidth={2} />
          <h2 className="text-sm font-medium text-white">List a new product</h2>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white transition-colors focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Description</label>
            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white transition-colors focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Price</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-neutral-950 py-2 pl-7 pr-3 text-sm text-white transition-colors focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {createError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs text-red-300">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              {createError.message}
            </div>
          )}
          {justAdded && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              Product listed.
            </div>
          )}

          <button
            type="submit"
            disabled={creating}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/30 transition-colors hover:bg-indigo-400 disabled:opacity-60"
          >
            {creating && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
            {creating ? "Listing…" : "List product"}
          </button>
        </form>
      </Card>

      <div className="mt-8">
        <SectionHeading title="Your products" count={!productsQuery.loading ? myProducts.length : undefined} />

        {productsQuery.loading && (
          <Card className="divide-y divide-white/10">
            <CardRowSkeleton />
          </Card>
        )}
        {productsQuery.error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
            {productsQuery.error.message}
          </div>
        )}

        {!productsQuery.loading && !productsQuery.error && (
          <Card className="divide-y divide-white/10">
            {myProducts.length === 0 && (
              <EmptyState icon={Package} title="Nothing listed yet" description="Products you list will show up here." />
            )}
            {myProducts.map((p) => (
              <CardRow key={p.id}>
                <div>
                  <p className="text-sm text-white">{p.name}</p>
                  <p className="text-xs text-neutral-400">{p.description}</p>
                </div>
                <span className="text-sm font-medium text-white">${p.price.toFixed(2)}</span>
              </CardRow>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
