"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { ClipboardList, ChevronRight, AlertTriangle } from "lucide-react";
import { GET_ORDERS } from "@/lib/graphql/queries";
import { useSession } from "@/lib/useSession";
import { Card, SectionHeading } from "@/components/ui/Card";
import { CardRowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge, STATUS_VARIANT } from "@/components/ui/Badge";

type Order = {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  status: string;
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
        <Link href="/login" className="font-medium text-indigo-300 hover:underline">
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
          className="font-medium text-indigo-300 hover:underline"
        >
          go to your dashboard →
        </Link>
      </p>
    );
  }

  const myOrders = (data?.getOrders ?? []).filter((o) => o.userId === session.userId);

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white">
          {session.username.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">{session.username}</h1>
          <p className="text-sm text-neutral-400">{session.email}</p>
        </div>
      </div>

      <div className="mt-8">
        <SectionHeading
          title="Order history"
          count={!loading ? myOrders.length : undefined}
          hint="Filtered client-side — the schema has no per-user order query."
        />

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={2} />
            {error.message}
          </div>
        )}

        {loading && (
          <Card className="divide-y divide-white/10">
            <CardRowSkeleton />
            <CardRowSkeleton />
          </Card>
        )}

        {!loading && !error && myOrders.length === 0 && (
          <Card>
            <EmptyState icon={ClipboardList} title="No orders yet" description="Requests you place will show up here." />
          </Card>
        )}

        {!loading && !error && myOrders.length > 0 && (
          <Card className="divide-y divide-white/10">
            {myOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-white/[0.03]"
              >
                <div>
                  <p className="text-sm text-white">Order #{order.id.slice(-6)}</p>
                  <p className="text-xs text-neutral-400">Qty {order.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_VARIANT[order.status] ?? "neutral"}>{order.status}</Badge>
                  <ChevronRight className="h-4 w-4 text-neutral-600" strokeWidth={2} />
                </div>
              </Link>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
