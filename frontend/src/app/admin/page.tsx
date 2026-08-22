"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  ShieldCheck,
  Users,
  ClipboardList,
  Package,
  Ban,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { GET_ACCOUNTS, GET_ORDERS, GET_PRODUCTS } from "@/lib/graphql/queries";
import { SET_ACCOUNT_ACTIVE } from "@/lib/graphql/mutations";
import { useSession } from "@/lib/useSession";
import { Card, CardRow, SectionHeading } from "@/components/ui/Card";
import { CardRowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge, ROLE_VARIANT, STATUS_VARIANT } from "@/components/ui/Badge";

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

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number | string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-neutral-500">
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        <p className="text-xs">{label}</p>
      </div>
      <p className="mt-1.5 text-2xl font-semibold text-white">{value}</p>
    </Card>
  );
}

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
        <Link href="/login" className="font-medium text-indigo-300 hover:underline">
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
    <div className="max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
          <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Admin dashboard</h1>
          <p className="text-sm text-neutral-400">{session.username}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <StatCard icon={Users} label="Accounts" value={accounts.data?.getAccounts.length ?? "—"} />
        <StatCard icon={ClipboardList} label="Orders" value={orders.data?.getOrders.length ?? "—"} />
        <StatCard icon={Package} label="Products" value={products.data?.getProducts.length ?? "—"} />
      </div>

      <div className="mt-8">
        <SectionHeading title="Users & sellers" hint="Deactivating blocks login." />

        {accounts.loading && (
          <Card className="divide-y divide-white/10">
            <CardRowSkeleton />
          </Card>
        )}
        {accounts.error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
            {accounts.error.message}
          </div>
        )}
        {!accounts.loading && !accounts.error && (
          <Card className="divide-y divide-white/10">
            {(accounts.data?.getAccounts ?? []).length === 0 && (
              <EmptyState icon={Users} title="No accounts" />
            )}
            {(accounts.data?.getAccounts ?? []).map((a) => (
              <CardRow key={a.id}>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-semibold text-neutral-300">
                    {a.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white">{a.username}</p>
                      <Badge variant={ROLE_VARIANT[a.role] ?? "neutral"}>{a.role}</Badge>
                    </div>
                    <p className="text-xs text-neutral-400">{a.email}</p>
                  </div>
                </div>
                {a.role === "admin" ? (
                  <span className="text-xs text-neutral-600">—</span>
                ) : (
                  <button
                    onClick={() => toggleActive(a.id, !a.active)}
                    disabled={togglingAny}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-60 ${
                      a.active
                        ? "border border-white/15 text-neutral-300 hover:border-red-400/50 hover:text-red-400"
                        : "bg-emerald-500/90 text-white hover:bg-emerald-500"
                    }`}
                  >
                    {a.active ? (
                      <>
                        <Ban className="h-3 w-3" strokeWidth={2} />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-3 w-3" strokeWidth={2} />
                        Activate
                      </>
                    )}
                  </button>
                )}
              </CardRow>
            ))}
          </Card>
        )}
      </div>

      <div className="mt-8">
        <SectionHeading title="All orders" />

        {orders.loading && (
          <Card className="divide-y divide-white/10">
            <CardRowSkeleton />
          </Card>
        )}
        {orders.error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
            {orders.error.message}
          </div>
        )}
        {!orders.loading && !orders.error && (
          <Card className="divide-y divide-white/10">
            {(orders.data?.getOrders ?? []).length === 0 && (
              <EmptyState icon={ClipboardList} title="No orders yet" />
            )}
            {(orders.data?.getOrders ?? []).map((o) => (
              <CardRow key={o.id}>
                <div>
                  <p className="text-sm text-white">Order #{o.id.slice(-6)}</p>
                  <p className="text-xs text-neutral-400">
                    User {o.userId.slice(-6)} · Product {o.productId.slice(-6)} · Qty {o.quantity}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[o.status] ?? "neutral"}>{o.status}</Badge>
              </CardRow>
            ))}
          </Card>
        )}
      </div>

      <div className="mt-8">
        <SectionHeading title="All products" />

        {products.loading && (
          <Card className="divide-y divide-white/10">
            <CardRowSkeleton />
          </Card>
        )}
        {products.error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
            {products.error.message}
          </div>
        )}
        {!products.loading && !products.error && (
          <Card className="divide-y divide-white/10">
            {(products.data?.getProducts ?? []).length === 0 && (
              <EmptyState icon={Package} title="No products yet" />
            )}
            {(products.data?.getProducts ?? []).map((p) => (
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
