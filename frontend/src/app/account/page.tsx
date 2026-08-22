"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { GET_ORDERS } from "@/lib/graphql/queries";
import { useSession } from "@/lib/useSession";

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

export default function AccountPage() {
  const { session, ready } = useSession();
  const { data, loading, error } = useQuery<{ getOrders: Order[] }>(GET_ORDERS, {
    skip: !session,
  });

  if (!ready) return null;

  if (!session) {
    return (
      <p className="text-sm text-neutral-400">
        <Link href="/login" className="text-indigo-300 hover:underline">
          Log in
        </Link>{" "}
        to view your account.
      </p>
    );
  }

  if (session.role !== "user") {
    return (
      <p className="text-sm text-neutral-400">
        This is the buyer account page. You&apos;re signed in as a{" "}
        <span className="text-white">{session.role}</span> —{" "}
        <Link
          href={session.role === "seller" ? "/sell" : "/admin"}
          className="text-indigo-300 hover:underline"
        >
          go to your dashboard →
        </Link>
      </p>
    );
  }

  const myOrders = (data?.getOrders ?? []).filter((o) => o.userId === session.userId);

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold text-white">{session.username}</h1>
      <p className="mt-1 text-sm text-neutral-400">{session.email}</p>

      <h2 className="mt-8 text-sm font-medium text-white">Order history</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Filtered client-side from <code>getOrders</code> — the schema has no
        per-user order query.
      </p>

      {loading && <p className="mt-4 text-sm text-neutral-400">Loading…</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error.message}</p>}

      {!loading && !error && myOrders.length === 0 && (
        <p className="mt-4 text-sm text-neutral-400">No orders yet.</p>
      )}

      <div className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 bg-neutral-900/60">
        {myOrders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="flex items-center justify-between px-5 py-4 hover:bg-white/5"
          >
            <div>
              <p className="text-sm text-white">Order #{order.id.slice(-6)}</p>
              <p className="text-xs text-neutral-400">Qty {order.quantity}</p>
            </div>
            <span className={`text-xs font-medium ${statusColor[order.status] ?? "text-neutral-400"}`}>
              {order.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
