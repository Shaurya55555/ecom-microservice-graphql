"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { Ban, ClipboardList, Package, RotateCcw, Search, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { GET_ACCOUNTS, GET_ORDERS, GET_PRODUCTS } from "@/lib/graphql/queries";
import { SET_ACCOUNT_ACTIVE } from "@/lib/graphql/mutations";
import type { Account, Order, Product } from "@/lib/types";
import type { Session } from "@/lib/auth";
import { cn, friendlyError, formatPrice } from "@/lib/utils";
import { RequireRole } from "@/components/layout/RequireRole";
import { Badge, ROLE_VARIANT, STATUS_VARIANT } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, SectionHeading } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { controlClass } from "@/components/ui/Field";
import { CardRowSkeleton } from "@/components/ui/Skeleton";

export default function AdminPage() {
  return (
    <RequireRole roles={["admin"]} what="the admin dashboard">
      {(session) => <Dashboard session={session} />}
    </RequireRole>
  );
}

const ROLE_FILTERS = ["all", "user", "seller", "admin"] as const;

function Dashboard({ session }: { session: Session }) {
  const orders = useQuery<{ getOrders: Order[] }>(GET_ORDERS);
  const products = useQuery<{ getProducts: Product[] }>(GET_PRODUCTS);
  const accounts = useQuery<{ getAccounts: Account[] }>(GET_ACCOUNTS);
  const [setActive] = useMutation(SET_ACCOUNT_ACTIVE);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<(typeof ROLE_FILTERS)[number]>("all");
  const [search, setSearch] = useState("");

  const productById = useMemo(
    () => new Map((products.data?.getProducts ?? []).map((p) => [p.id, p])),
    [products.data]
  );
  const allOrders = orders.data?.getOrders ?? [];
  const byStatus = (s: string) => allOrders.filter((o) => o.status === s).length;
  const gmv = allOrders
    .filter((o) => o.status === "Accepted")
    .reduce((sum, o) => sum + (productById.get(o.productId)?.price ?? 0) * o.quantity, 0);

  const visibleAccounts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (accounts.data?.getAccounts ?? []).filter(
      (a) =>
        (roleFilter === "all" || a.role === roleFilter) &&
        (!q || a.username.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
    );
  }, [accounts.data, roleFilter, search]);

  async function toggleActive(account: Account) {
    setBusyId(account.id);
    try {
      await setActive({ variables: { userId: account.id, active: !account.active } });
      await accounts.refetch();
      toast.success(`${account.username} ${account.active ? "deactivated" : "reactivated"}`);
    } catch (err) {
      toast.error(friendlyError(err, "Couldn't update that account."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="animate-fade-in">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-fg sm:text-4xl">Admin dashboard</h1>
        <p className="mt-1 text-sm text-muted">Signed in as {session.username}</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Users} label="Accounts" value={accounts.data?.getAccounts.length} />
        <Stat icon={Package} label="Products" value={products.data?.getProducts.length} />
        <Stat icon={ClipboardList} label="Orders" value={orders.data ? allOrders.length : undefined} />
        <Stat icon={ShieldCheck} label="Accepted value" value={orders.data && products.data ? formatPrice(gmv) : undefined} />
      </div>

      {orders.data && allOrders.length > 0 && (
        <Card className="mt-3 p-4">
          <p className="text-xs text-subtle">Order outcomes</p>
          <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-surface-2" role="img" aria-label={`${byStatus("Accepted")} accepted, ${byStatus("Pending")} pending, ${byStatus("Rejected")} rejected`}>
            <div className="bg-success" style={{ width: `${(byStatus("Accepted") / allOrders.length) * 100}%` }} />
            <div className="bg-warning" style={{ width: `${(byStatus("Pending") / allOrders.length) * 100}%` }} />
            <div className="bg-danger" style={{ width: `${(byStatus("Rejected") / allOrders.length) * 100}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
            {(["Accepted", "Pending", "Rejected"] as const).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <Badge variant={STATUS_VARIANT[s]}>{s}</Badge>
                <span className="tabular-nums">{byStatus(s)}</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      <section className="mt-10">
        <SectionHeading title="Accounts" hint="Deactivating an account blocks login." />

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" strokeWidth={2} aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              aria-label="Search accounts"
              className={controlClass(false, "h-10 pl-9")}
            />
          </div>
          <div role="group" aria-label="Filter by role" className="flex gap-1 rounded-lg border border-line bg-surface p-1">
            {ROLE_FILTERS.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={roleFilter === r}
                onClick={() => setRoleFilter(r)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  roleFilter === r ? "bg-brand text-brand-fg" : "text-muted hover:text-fg"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {accounts.error && <ErrorState error={accounts.error} title="Couldn't load accounts" onRetry={() => accounts.refetch()} />}
        {accounts.loading && (
          <Card className="divide-y divide-line">
            <CardRowSkeleton />
            <CardRowSkeleton />
            <CardRowSkeleton />
          </Card>
        )}
        {accounts.data && (
          <Card className="divide-y divide-line">
            {visibleAccounts.length === 0 && (
              <EmptyState icon={Users} title="No accounts match" description="Try a different search or role filter." />
            )}
            {visibleAccounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-muted",
                      !a.active && "opacity-50"
                    )}
                  >
                    {a.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-fg">{a.username}</p>
                      <Badge variant={ROLE_VARIANT[a.role] ?? "neutral"}>{a.role}</Badge>
                      {!a.active && <Badge variant="red">Deactivated</Badge>}
                    </div>
                    <p className="truncate text-xs text-subtle">{a.email}</p>
                  </div>
                </div>
                {a.role === "admin" ? (
                  <span className="text-xs text-subtle" aria-label="Admin accounts can't be deactivated">
                    —
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant={a.active ? "danger" : "success"}
                    loading={busyId === a.id}
                    disabled={busyId !== null}
                    onClick={() => toggleActive(a)}
                  >
                    {a.active ? (
                      <>
                        <Ban className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                        Activate
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))}
          </Card>
        )}
      </section>

      <section className="mt-10">
        <SectionHeading title="Recent orders" count={orders.data ? allOrders.length : undefined} />
        {orders.error && <ErrorState error={orders.error} title="Couldn't load orders" onRetry={() => orders.refetch()} />}
        {orders.data && (
          <Card className="divide-y divide-line">
            {allOrders.length === 0 && <EmptyState icon={ClipboardList} title="No orders yet" />}
            {[...allOrders]
              .reverse()
              .slice(0, 8)
              .map((o) => {
                const p = productById.get(o.productId);
                return (
                  <div key={o.id} className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
                    <div className="min-w-0">
                      {p ? (
                        <Link href={`/products/${p.id}`} className="block truncate text-sm text-fg hover:text-brand-text">
                          {p.name}
                        </Link>
                      ) : (
                        <p className="text-sm text-fg">Unknown product</p>
                      )}
                      <p className="text-xs text-subtle">
                        Order #{o.id.slice(-6).toUpperCase()} · Qty {o.quantity}
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANT[o.status] ?? "neutral"}>{o.status}</Badge>
                  </div>
                );
              })}
          </Card>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value?: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-subtle">
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        <p className="text-xs">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-fg">{value ?? "—"}</p>
    </Card>
  );
}
