"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_ACCOUNTS, GET_ORDERS, GET_PRODUCTS } from "@/lib/graphql/queries";
import { SET_ACCOUNT_ACTIVE } from "@/lib/graphql/mutations";
import { useSession } from "@/lib/useSession";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};

type Order = {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  status: string;
};

type Account = {
  id: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
};

const statusColor: Record<string, string> = {
  Pending: "text-amber-400",
  Accepted: "text-emerald-400",
  Rejected: "text-red-400",
};

export default function AdminPage() {
  const { session, ready } = useSession();
  const skip = !session || session.role !== "admin";
  const orders = useQuery<{ getOrders: Order[] }>(GET_ORDERS, { skip });
  const products = useQuery<{ getProducts: Product[] }>(GET_PRODUCTS, { skip });
  const accounts = useQuery<{ getAccounts: Account[] }>(GET_ACCOUNTS, { skip });
  const [setActive, { loading: togglingAny }] = useMutation(SET_ACCOUNT_ACTIVE);

  if (!ready) return null;

  if (!session) {
    return (
      <p className="text-sm text-neutral-400">
        <Link href="/login" className="text-indigo-300 hover:underline">
          Log in
        </Link>{" "}
        to access the admin dashboard.
      </p>
    );
  }

  if (session.role !== "admin") {
    return (
      <p className="text-sm text-neutral-400">
        This dashboard is for admin accounts. You&apos;re signed in as a{" "}
        <span className="text-white">{session.role}</span>.
      </p>
    );
  }

  async function toggleActive(id: string, active: boolean) {
    await setActive({ variables: { userId: id, active } });
    accounts.refetch();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold text-white">Admin dashboard</h1>
      <p className="mt-1 text-sm text-neutral-400">{session.username}</p>

      <h2 className="mt-8 text-sm font-medium text-white">
        Users &amp; sellers {accounts.data ? `(${accounts.data.getAccounts.length})` : ""}
      </h2>
      <p className="mt-1 text-xs text-neutral-500">
        Deactivating an account blocks it from logging in.
      </p>
      {accounts.loading && <p className="mt-4 text-sm text-neutral-400">Loading…</p>}
      {accounts.error && <p className="mt-4 text-sm text-red-400">{accounts.error.message}</p>}
      <div className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 bg-neutral-900/60">
        {(accounts.data?.getAccounts ?? []).map((a) => (
          <div key={a.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm text-white">
                {a.username} <span className="text-xs text-neutral-500">({a.role})</span>
              </p>
              <p className="text-xs text-neutral-400">{a.email}</p>
            </div>
            {a.role === "admin" ? (
              <span className="text-xs text-neutral-500">—</span>
            ) : (
              <button
                onClick={() => toggleActive(a.id, !a.active)}
                disabled={togglingAny}
                className={`rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-60 ${
                  a.active
                    ? "border border-white/15 text-neutral-300 hover:border-red-400/50 hover:text-red-400"
                    : "bg-emerald-500/90 text-white hover:bg-emerald-500"
                }`}
              >
                {a.active ? "Deactivate" : "Activate"}
              </button>
            )}
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-sm font-medium text-white">
        All orders {orders.data ? `(${orders.data.getOrders.length})` : ""}
      </h2>
      {orders.loading && <p className="mt-4 text-sm text-neutral-400">Loading…</p>}
      {orders.error && <p className="mt-4 text-sm text-red-400">{orders.error.message}</p>}
      <div className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 bg-neutral-900/60">
        {(orders.data?.getOrders ?? []).map((o) => (
          <div key={o.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm text-white">Order #{o.id.slice(-6)}</p>
              <p className="text-xs text-neutral-400">
                User {o.userId.slice(-6)} · Product {o.productId.slice(-6)} · Qty {o.quantity}
              </p>
            </div>
            <span className={`text-xs font-medium ${statusColor[o.status] ?? "text-neutral-400"}`}>
              {o.status}
            </span>
          </div>
        ))}
        {orders.data?.getOrders.length === 0 && (
          <p className="px-5 py-4 text-sm text-neutral-400">No orders yet.</p>
        )}
      </div>

      <h2 className="mt-8 text-sm font-medium text-white">
        All products {products.data ? `(${products.data.getProducts.length})` : ""}
      </h2>
      {products.loading && <p className="mt-4 text-sm text-neutral-400">Loading…</p>}
      {products.error && <p className="mt-4 text-sm text-red-400">{products.error.message}</p>}
      <div className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 bg-neutral-900/60">
        {(products.data?.getProducts ?? []).map((p) => (
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
