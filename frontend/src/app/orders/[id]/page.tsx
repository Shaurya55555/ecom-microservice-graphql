"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { ArrowLeft, Clock, Check, X, RefreshCw, Package } from "lucide-react";
import { GET_ORDER } from "@/lib/graphql/queries";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

type Order = {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  status: string;
};

const STEPS = [
  { key: "Pending", label: "Requested", icon: Clock },
  { key: "Accepted", label: "Accepted", icon: Check },
];

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
  const isRejected = order?.status === "Rejected";
  const stepIndex = order ? Math.max(STEPS.findIndex((s) => s.key === order.status), 0) : 0;

  return (
    <div className="max-w-lg animate-fade-in">
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Order history
      </Link>

      <h1 className="mt-4 text-lg font-semibold text-white">Order #{id.slice(-6)}</h1>

      {loading && !order && (
        <Card className="mt-6 p-6">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-6 h-8 w-full" />
          <Skeleton className="mt-4 h-3 w-24" />
        </Card>
      )}
      {error && (
        <p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          {error.message}
        </p>
      )}
      {!loading && !error && !order && (
        <p className="mt-4 text-sm text-neutral-400">Order not found.</p>
      )}

      {order && (
        <Card className="mt-6 p-6">
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Package className="h-4 w-4 text-neutral-500" strokeWidth={2} />
            Product <span className="text-white">{order.productId}</span> · Qty{" "}
            <span className="text-white">{order.quantity}</span>
          </div>

          {!isRejected ? (
            <div className="mt-8 flex items-center">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = i <= stepIndex;
                return (
                  <div key={step.key} className="flex flex-1 flex-col items-center last:flex-none">
                    <div className="flex w-full items-center">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-2 transition-colors ${
                          done ? "bg-indigo-500 text-white ring-indigo-500/40" : "bg-white/5 text-neutral-500 ring-white/10"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`h-0.5 flex-1 ${i < stepIndex ? "bg-indigo-500" : "bg-white/10"}`} />
                      )}
                    </div>
                    <span className={`mt-2 text-xs ${done ? "text-white" : "text-neutral-500"}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400 ring-2 ring-red-500/30">
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </div>
              <span className="text-sm text-red-300">Rejected by seller</span>
            </div>
          )}

          <p className="mt-6 flex items-center gap-1.5 text-xs text-neutral-500">
            <RefreshCw className="h-3 w-3" strokeWidth={2} />
            Polling <code className="text-neutral-400">getOrder</code> every 3s — updates live once the
            seller responds.
          </p>
        </Card>
      )}
    </div>
  );
}
