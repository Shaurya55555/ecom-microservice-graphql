"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { Check, DollarSign, Inbox, Package, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { DELETE_PRODUCT, RESPOND_TO_ORDER } from "@/lib/graphql/mutations";
import { GET_PRODUCTS, GET_SELLER_ORDERS } from "@/lib/graphql/queries";
import type { Order, Product } from "@/lib/types";
import type { Session } from "@/lib/auth";
import { formatPrice, friendlyError, shortId } from "@/lib/utils";
import { RequireRole } from "@/components/layout/RequireRole";
import { ProductForm } from "@/components/seller/ProductForm";
import { ProductImage } from "@/components/product/ProductImage";
import { Badge, STATUS_VARIANT } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, SectionHeading } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { CardRowSkeleton } from "@/components/ui/Skeleton";

export default function SellPage() {
  return (
    <RequireRole roles={["seller"]} what="the seller dashboard">
      {(session) => <Dashboard session={session} />}
    </RequireRole>
  );
}

function Dashboard({ session }: { session: Session }) {
  const productsQuery = useQuery<{ getProducts: Product[] }>(GET_PRODUCTS);
  const ordersQuery = useQuery<{ getSellerOrders: Order[] }>(GET_SELLER_ORDERS, { pollInterval: 6000 });
  const [respond] = useMutation(RESPOND_TO_ORDER);
  const [deleteProduct, { loading: deleting }] = useMutation(DELETE_PRODUCT);

  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const allProducts = useMemo(() => productsQuery.data?.getProducts ?? [], [productsQuery.data]);
  const myProducts = useMemo(
    () => allProducts.filter((p) => p.sellerId === session.userId),
    [allProducts, session.userId]
  );
  const productById = useMemo(() => new Map(allProducts.map((p) => [p.id, p])), [allProducts]);

  const orders = useMemo(() => [...(ordersQuery.data?.getSellerOrders ?? [])].reverse(), [ordersQuery.data]);
  const pending = orders.filter((o) => o.status === "Pending");
  const past = orders.filter((o) => o.status !== "Pending");
  const revenue = orders
    .filter((o) => o.status === "Accepted")
    .reduce((sum, o) => sum + (productById.get(o.productId)?.price ?? 0) * o.quantity, 0);

  async function handleRespond(order: Order, accept: boolean) {
    setRespondingId(order.id);
    try {
      await respond({ variables: { id: order.id, accept } });
      await ordersQuery.refetch();
      toast.success(accept ? "Order accepted" : "Order rejected");
    } catch (err) {
      toast.error(friendlyError(err, "Couldn't update that order."));
    } finally {
      setRespondingId(null);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteProduct({ variables: { id: toDelete.id }, refetchQueries: [GET_PRODUCTS] });
      toast.success(`Deleted ${toDelete.name}`);
      if (editing?.id === toDelete.id) setEditing(null);
    } catch (err) {
      toast.error(friendlyError(err, "Couldn't delete that product."));
    } finally {
      setToDelete(null);
    }
  }

  return (
    <div className="animate-fade-in">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-fg sm:text-4xl">Seller dashboard</h1>
        <p className="mt-1 text-sm text-muted">Signed in as {session.username}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat icon={Inbox} label="Pending requests" value={ordersQuery.data ? pending.length : "—"} />
        <Stat icon={Package} label="Your products" value={productsQuery.data ? myProducts.length : "—"} />
        <Stat
          icon={DollarSign}
          label="Accepted sales"
          value={ordersQuery.data && productsQuery.data ? formatPrice(revenue) : "—"}
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <section>
            <SectionHeading title="Order requests" hint="Updates every few seconds" />
            {ordersQuery.error && (
              <ErrorState error={ordersQuery.error} title="Couldn't load requests" onRetry={() => ordersQuery.refetch()} />
            )}
            {ordersQuery.loading && !ordersQuery.data && (
              <Card className="divide-y divide-line">
                <CardRowSkeleton />
                <CardRowSkeleton />
              </Card>
            )}
            {ordersQuery.data && (
              <Card className="divide-y divide-line">
                {orders.length === 0 && (
                  <EmptyState
                    icon={Inbox}
                    title="No requests yet"
                    description="When a buyer orders one of your products, it lands here for you to accept or reject."
                  />
                )}
                {pending.map((o) => {
                  const p = productById.get(o.productId);
                  const busy = respondingId === o.id;
                  return (
                    <div key={o.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-5">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <ProductImage
                          src={p?.imageUrl}
                          alt=""
                          category={p?.category}
                          seed={o.productId}
                          className="h-12 w-12 shrink-0 rounded-lg border border-line"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-fg">{p?.name ?? "Unknown product"}</p>
                          <p className="text-xs text-subtle">
                            Request #{shortId(o.id)} · Qty {o.quantity}
                            {p && ` · ${formatPrice(p.price * o.quantity)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          loading={busy}
                          disabled={respondingId !== null}
                          onClick={() => handleRespond(o, true)}
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={respondingId !== null}
                          onClick={() => handleRespond(o, false)}
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {past.map((o) => {
                  const p = productById.get(o.productId);
                  return (
                    <div key={o.id} className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-fg">{p?.name ?? "Unknown product"}</p>
                        <p className="text-xs text-subtle">
                          Request #{shortId(o.id)} · Qty {o.quantity}
                        </p>
                      </div>
                      <Badge variant={STATUS_VARIANT[o.status] ?? "neutral"}>{o.status}</Badge>
                    </div>
                  );
                })}
              </Card>
            )}
          </section>

          <section>
            <SectionHeading title="Your products" count={productsQuery.data ? myProducts.length : undefined} />
            {productsQuery.error && (
              <ErrorState error={productsQuery.error} title="Couldn't load products" onRetry={() => productsQuery.refetch()} />
            )}
            {productsQuery.loading && !productsQuery.data && (
              <Card className="divide-y divide-line">
                <CardRowSkeleton />
                <CardRowSkeleton />
              </Card>
            )}
            {productsQuery.data && (
              <Card className="divide-y divide-line">
                {myProducts.length === 0 && (
                  <EmptyState
                    icon={Package}
                    title="Nothing listed yet"
                    description="Use the form to list your first product."
                  />
                )}
                {myProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                    <ProductImage
                      src={p.imageUrl}
                      alt=""
                      category={p.category}
                      seed={p.id}
                      className="h-12 w-12 shrink-0 rounded-lg border border-line"
                    />
                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${p.id}`} className="block truncate text-sm font-medium text-fg hover:text-brand-text">
                        {p.name}
                      </Link>
                      <p className="text-xs text-subtle">
                        {p.category || "General"} · {formatPrice(p.price)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(p);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        aria-label={`Edit ${p.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg"
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(p)}
                        aria-label={`Delete ${p.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      </button>
                    </div>
                  </div>
                ))}
              </Card>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ProductForm key={editing?.id ?? "new"} product={editing} onDone={() => setEditing(null)} />
        </aside>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this product?"
        description={`“${toDelete?.name ?? ""}” will be removed from the store. Existing orders keep their history.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Inbox;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-subtle">
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        <p className="text-xs">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-fg">{value}</p>
    </Card>
  );
}
