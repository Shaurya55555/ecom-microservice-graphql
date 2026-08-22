"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { GET_ORDER } from "@/lib/graphql/queries";

type Order = {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  status: string;
};

const STEPS = ["Pending", "Completed"];

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, loading, error } = useQuery<{ getOrder: Order | null }>(GET_ORDER, {
    variables: { id },
    pollInterval: 3000,
  });

  const order = data?.getOrder;
  const isCancelled = order?.status === "Cancelled";
  const stepIndex = order ? Math.max(STEPS.indexOf(order.status), 0) : 0;

  return (
    <div className="max-w-lg">
      <Link href="/account" className="text-xs text-neutral-400 hover:text-white">
        ← Order history
      </Link>

      <h1 className="mt-4 text-lg font-semibold text-white">Order #{id.slice(-6)}</h1>

      {loading && !order && <p className="mt-4 text-sm text-neutral-400">Loading…</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error.message}</p>}
      {!loading && !error && !order && (
        <p className="mt-4 text-sm text-neutral-400">Order not found.</p>
      )}

      {order && (
        <div className="mt-6 rounded-xl border border-white/10 bg-neutral-900/60 p-6">
          <p className="text-sm text-neutral-400">
            Product <span className="text-white">{order.productId}</span> · Qty{" "}
            <span className="text-white">{order.quantity}</span>
          </p>

          {!isCancelled ? (
            <div className="mt-6 flex items-center gap-2">
              {STEPS.map((step, i) => (
                <div key={step} className="flex flex-1 items-center gap-2">
                  <div
                    className={`h-2 flex-1 rounded-full ${
                      i <= stepIndex ? "bg-indigo-400" : "bg-white/10"
                    }`}
                  />
                  {i < STEPS.length - 1 && null}
                </div>
              ))}
            </div>
          ) : null}

          <p
            className={`mt-3 text-sm font-medium ${
              isCancelled
                ? "text-red-400"
                : order.status === "Completed"
                ? "text-emerald-400"
                : "text-amber-400"
            }`}
          >
            {order.status}
          </p>

          <p className="mt-6 text-xs text-neutral-500">
            Polling <code>getOrder</code> every 3s. In the current backend nothing
            transitions an order past <code>Pending</code> yet — the Kafka order
            consumer only logs the event, it doesn&apos;t write a new status. This
            page is wired for when that&apos;s added.
          </p>
        </div>
      )}
    </div>
  );
}
