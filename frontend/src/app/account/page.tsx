"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { ChevronRight, ClipboardList, Heart, ShoppingCart } from "lucide-react";
import { GET_ORDERS, GET_PRODUCTS } from "@/lib/graphql/queries";
import type { Order, Product } from "@/lib/types";
import { RequireRole } from "@/components/layout/RequireRole";
import { Card, SectionHeading } from "@/components/ui/Card";
import { CardRowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Badge, STATUS_VARIANT } from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/Button";
import { ProductImage } from "@/components/product/ProductImage";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCartCount } from "@/lib/redux/cartSlice";
import { formatPrice, shortId } from "@/lib/utils";
import type { Session } from "@/lib/auth";

export default function AccountPage() {
  return (
    <RequireRole roles={["user"]} what="your account">
      {(session) => <Account session={session} />}
    </RequireRole>
  );
}

function Account({ session }: { session: Session }) {
  const orders = useQuery<{ getOrders: Order[] }>(GET_ORDERS);
  const products = useQuery<{ getProducts: Product[] }>(GET_PRODUCTS);
  const wishCount = useAppSelector((s) => s.wishlist.ids.length);
  const cartCount = useAppSelector(selectCartCount);

  const productById = useMemo(
    () => new Map((products.data?.getProducts ?? []).map((p) => [p.id, p])),
    [products.data]
  );
  // The schema has no per-user order query, so scope to this buyer client-side.
  const mine = useMemo(
    () => [...(orders.data?.getOrders ?? [])].filter((o) => o.userId === session.userId).reverse(),
    [orders.data, session.userId]
  );

  const pending = mine.filter((o) => o.status === "Pending").length;
  const accepted = mine.filter((o) => o.status === "Accepted").length;
  const spent = mine
    .filter((o) => o.status === "Accepted")
    .reduce((sum, o) => sum + (productById.get(o.productId)?.price ?? 0) * o.quantity, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-semibold text-white shadow-lg shadow-indigo-500/25">
          {session.username.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">{session.username}</h1>
          <p className="text-sm text-muted">{session.email}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Awaiting seller" value={orders.loading ? "—" : pending} />
        <Stat label="Accepted orders" value={orders.loading ? "—" : accepted} />
        <Stat label="Accepted value" value={orders.loading || products.loading ? "—" : formatPrice(spent)} />
        <div className="grid grid-cols-2 gap-3">
          <Link href="/wishlist" className="rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-brand/40">
            <Heart className="h-4 w-4 text-rose-500" strokeWidth={2} aria-hidden />
            <p className="mt-2 text-lg font-semibold tabular-nums text-fg">{wishCount}</p>
            <p className="text-xs text-subtle">Wishlist</p>
          </Link>
          <Link href="/cart" className="rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-brand/40">
            <ShoppingCart className="h-4 w-4 text-brand-text" strokeWidth={2} aria-hidden />
            <p className="mt-2 text-lg font-semibold tabular-nums text-fg">{cartCount}</p>
            <p className="text-xs text-subtle">In cart</p>
          </Link>
        </div>
      </div>

      <section className="mt-10">
        <SectionHeading title="Order history" count={orders.loading ? undefined : mine.length} />

        {orders.error && <ErrorState error={orders.error} title="Couldn't load your orders" onRetry={() => orders.refetch()} />}

        {orders.loading && (
          <Card className="divide-y divide-line">
            <CardRowSkeleton />
            <CardRowSkeleton />
            <CardRowSkeleton />
          </Card>
        )}

        {!orders.loading && !orders.error && mine.length === 0 && (
          <Card>
            <EmptyState
              icon={ClipboardList}
              title="No orders yet"
              description="Orders you place will show up here, with live status updates from the seller."
              action={
                <Link href="/products" className={buttonStyles({})}>
                  Start shopping
                </Link>
              }
            />
          </Card>
        )}

        {!orders.loading && !orders.error && mine.length > 0 && (
          <Card className="divide-y divide-line">
            {mine.map((order) => {
              const product = productById.get(order.productId);
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-4 px-4 py-4 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-surface-2/60 sm:px-5"
                >
                  <ProductImage
                    src={product?.imageUrl}
                    alt=""
                    category={product?.category}
                    seed={order.productId}
                    className="h-14 w-14 shrink-0 rounded-lg border border-line"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg">
                      {product?.name ?? "Product no longer available"}
                    </p>
                    <p className="mt-0.5 text-xs text-subtle">
                      Order #{shortId(order.id)} · Qty {order.quantity}
                      {product && ` · ${formatPrice(product.price * order.quantity)}`}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[order.status] ?? "neutral"}>{order.status}</Badge>
                  <ChevronRight className="hidden h-4 w-4 text-subtle sm:block" strokeWidth={2} aria-hidden />
                </Link>
              );
            })}
          </Card>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-subtle">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums text-fg">{value}</p>
    </Card>
  );
}
