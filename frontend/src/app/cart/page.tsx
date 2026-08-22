"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { ShoppingCart, Minus, Plus, Trash2, AlertCircle, Loader2, PackageCheck } from "lucide-react";
import { CREATE_ORDER } from "@/lib/graphql/mutations";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { removeItem, setQuantity, clearCart } from "@/lib/redux/cartSlice";
import { useSession } from "@/lib/useSession";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

type CreateOrderResult = {
  createOrder: {
    id: string;
    status: string;
  };
};

export default function CartPage() {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const { session, ready } = useSession();
  const [createOrder] = useMutation<CreateOrderResult>(CREATE_ORDER);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const router = useRouter();

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (ready && session && session.role !== "user") {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Your cart</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Placing orders is only available for buyer accounts. You&apos;re signed in as a{" "}
          <span className="text-white">{session.role}</span> —{" "}
          <Link
            href={session.role === "seller" ? "/sell" : "/admin"}
            className="text-indigo-300 hover:underline"
          >
            go to your dashboard →
          </Link>
        </p>
      </div>
    );
  }

  async function handleCheckout() {
    if (!session) return;
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const createdOrderIds: string[] = [];
      for (const item of items) {
        const { data } = await createOrder({
          variables: {
            productId: item.productId,
            userId: session.userId,
            quantity: item.quantity,
          },
        });
        if (data?.createOrder) createdOrderIds.push(data.createOrder.id);
      }
      dispatch(clearCart());
      if (createdOrderIds.length > 0) {
        router.push(`/orders/${createdOrderIds[0]}`);
      } else {
        router.push("/account");
      }
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setCheckingOut(false);
    }
  }

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Your cart</h1>
        <Card className="mt-6">
          <EmptyState icon={ShoppingCart} title="Your cart is empty" />
          <div className="pb-6 text-center">
            <Link href="/" className="text-sm font-medium text-indigo-300 hover:underline">
              Browse products →
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Your cart</h1>

      <Card className="mt-6 divide-y divide-white/10">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="truncate text-sm text-white">{item.name}</p>
              <p className="text-xs text-neutral-400">${item.price.toFixed(2)} each</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex items-center rounded-lg border border-white/10 bg-neutral-950">
                <button
                  onClick={() =>
                    dispatch(setQuantity({ productId: item.productId, quantity: item.quantity - 1 }))
                  }
                  aria-label="Decrease quantity"
                  className="flex h-7 w-7 items-center justify-center text-neutral-400 hover:text-white"
                >
                  <Minus className="h-3 w-3" strokeWidth={2.5} />
                </button>
                <span className="w-6 text-center text-sm text-white">{item.quantity}</span>
                <button
                  onClick={() =>
                    dispatch(setQuantity({ productId: item.productId, quantity: item.quantity + 1 }))
                  }
                  aria-label="Increase quantity"
                  className="flex h-7 w-7 items-center justify-center text-neutral-400 hover:text-white"
                >
                  <Plus className="h-3 w-3" strokeWidth={2.5} />
                </button>
              </div>
              <button
                onClick={() => dispatch(removeItem({ productId: item.productId }))}
                aria-label="Remove item"
                className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </Card>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-neutral-900/50 px-5 py-4">
        <span className="text-sm text-neutral-400">Total</span>
        <span className="text-xl font-semibold text-white">${total.toFixed(2)}</span>
      </div>

      {!ready ? null : !session ? (
        <p className="mt-6 text-sm text-neutral-400">
          <Link href="/login" className="font-medium text-indigo-300 hover:underline">
            Log in
          </Link>{" "}
          to place your order — the order service requires a valid JWT.
        </p>
      ) : (
        <button
          onClick={handleCheckout}
          disabled={checkingOut}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/30 transition-colors hover:bg-indigo-400 disabled:opacity-60"
        >
          {checkingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <PackageCheck className="h-4 w-4" strokeWidth={2} />
          )}
          {checkingOut ? "Placing order…" : "Place Order"}
        </button>
      )}
      {checkoutError && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs text-red-300">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          {checkoutError}
        </div>
      )}
    </div>
  );
}
