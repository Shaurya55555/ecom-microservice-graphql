"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { ArrowLeft, Check, CheckCircle2, Clock, MapPin, PackageSearch, RefreshCw, X } from "lucide-react";
import { GET_ORDER, GET_PRODUCT } from "@/lib/graphql/queries";
import type { Order, Product } from "@/lib/types";
import { loadOrderShipping } from "@/lib/shipping";
import type { ShippingValues } from "@/lib/validation/schemas";
import { formatPrice, shortId } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge, STATUS_VARIANT } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { buttonStyles } from "@/components/ui/Button";
import { ProductImage } from "@/components/product/ProductImage";
import { RequireRole } from "@/components/layout/RequireRole";

const STEPS = [
  { key: "Pending", label: "Requested", hint: "Waiting for the seller", icon: Clock },
  { key: "Accepted", label: "Accepted", hint: "The seller is on it", icon: Check },
] as const;

export function OrderDetail({ id }: { id: string }) {
  return (
    <RequireRole roles={["user"]} what="this order">
      {(session) => <Detail id={id} userId={session.userId} />}
    </RequireRole>
  );
}

function Detail({ id, userId }: { id: string; userId: string }) {
  const justPlaced = useSearchParams().get("placed") === "1";
  const { data, loading, error, refetch, startPolling, stopPolling } = useQuery<{ getOrder: Order | null }>(
    GET_ORDER,
    { variables: { id } }
  );
  const order = data?.getOrder ?? null;

  // Live status: poll only while the seller hasn't decided yet.
  const status = order?.status;
  useEffect(() => {
    if (status === "Pending") startPolling(4000);
    else stopPolling();
    return () => stopPolling();
  }, [status, startPolling, stopPolling]);
  const product = useQuery<{ getProduct: Product | null }>(GET_PRODUCT, {
    variables: { id: order?.productId },
    skip: !order,
  });
  // Safe to read here: this renders only after RequireRole's client-only `ready` gate.
  const shipping = useMemo<ShippingValues | null>(() => loadOrderShipping(id), [id]);

  const item = product.data?.getProduct ?? null;
  const rejected = order?.status === "Rejected";
  const stepIndex = order ? Math.max(STEPS.findIndex((s) => s.key === order.status), 0) : 0;
  const notMine = !!order && order.userId !== userId;

  return (
    <div className="max-w-2xl animate-fade-in">
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        Order history
      </Link>

      {justPlaced && (
        <div
          role="status"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-success/25 bg-success-soft px-4 py-4"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" strokeWidth={2} aria-hidden />
          <div>
            <p className="text-sm font-semibold text-fg">Thanks — your order is in!</p>
            <p className="mt-0.5 text-sm text-muted">
              The seller has been notified. This page updates automatically when they respond.
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Order #{shortId(id)}</h1>
        {order && <Badge variant={STATUS_VARIANT[order.status] ?? "neutral"}>{order.status}</Badge>}
      </div>

      {loading && !order && <Skeleton className="mt-6 h-72 w-full rounded-2xl" />}
      {error && !order && (
        <div className="mt-6">
          <ErrorState error={error} title="Couldn't load this order" onRetry={() => refetch()} />
        </div>
      )}
      {!loading && !error && (!order || notMine) && (
        <div className="mt-6">
          <EmptyState
            icon={PackageSearch}
            title="Order not found"
            description="It may not exist, or it belongs to a different account."
            action={
              <Link href="/account" className={buttonStyles({ variant: "secondary" })}>
                Back to your orders
              </Link>
            }
          />
        </div>
      )}

      {order && !notMine && (
        <div className="mt-6 space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <ProductImage
                src={item?.imageUrl}
                alt=""
                category={item?.category}
                seed={order.productId}
                className="h-16 w-16 shrink-0 rounded-xl border border-line"
              />
              <div className="min-w-0 flex-1">
                {item ? (
                  <Link href={`/products/${item.id}`} className="block truncate text-sm font-medium text-fg hover:text-brand-text">
                    {item.name}
                  </Link>
                ) : (
                  <p className="text-sm font-medium text-fg">{product.loading ? "Loading…" : "Product no longer available"}</p>
                )}
                <p className="mt-0.5 text-xs text-subtle">
                  Qty {order.quantity}
                  {item && ` · ${formatPrice(item.price)} each`}
                </p>
              </div>
              {item && (
                <p className="text-base font-semibold tabular-nums text-fg">
                  {formatPrice(item.price * order.quantity)}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-fg">Status</h2>
            {!rejected ? (
              <ol className="mt-6 flex items-start" aria-label="Order progress">
                {STEPS.map((step, i) => {
                  const done = i <= stepIndex;
                  const Icon = step.icon;
                  return (
                    <li
                      key={step.key}
                      aria-current={i === stepIndex ? "step" : undefined}
                      className={cn("flex flex-col", i < STEPS.length - 1 ? "flex-1" : "items-end text-right")}
                    >
                      <div className="flex w-full items-center">
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-2 transition-colors",
                            done ? "bg-brand text-brand-fg ring-brand/30" : "bg-surface-2 text-subtle ring-line"
                          )}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                        </span>
                        {i < STEPS.length - 1 && (
                          <span
                            aria-hidden
                            className={cn("mx-2 h-0.5 flex-1 rounded", i < stepIndex ? "bg-brand" : "bg-line")}
                          />
                        )}
                      </div>
                      <span className={cn("mt-2.5 text-sm font-medium", done ? "text-fg" : "text-subtle")}>
                        {step.label}
                      </span>
                      <span className="text-xs text-subtle">{step.hint}</span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="mt-5 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger ring-2 ring-danger/25">
                  <X className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-medium text-danger">Rejected by the seller</p>
                  <p className="text-xs text-subtle">You haven&apos;t been charged. Try another seller or product.</p>
                </div>
              </div>
            )}
            {order.status === "Pending" && (
              <p className="mt-6 flex items-center gap-1.5 text-xs text-subtle">
                <RefreshCw className="h-3 w-3" strokeWidth={2} aria-hidden />
                Checking for updates every few seconds…
              </p>
            )}
          </Card>

          {shipping && (
            <Card className="p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-text" strokeWidth={2} aria-hidden />
                <h2 className="text-sm font-semibold text-fg">Shipping to</h2>
              </div>
              <address className="mt-3 text-sm not-italic leading-relaxed text-muted">
                <span className="font-medium text-fg">{shipping.fullName}</span>
                <br />
                {shipping.address}
                <br />
                {shipping.city}, {shipping.state} {shipping.postalCode}
                <br />
                {shipping.country}
                <br />
                {shipping.phone}
              </address>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
