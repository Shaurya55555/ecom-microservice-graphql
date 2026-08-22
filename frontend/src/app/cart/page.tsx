"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { CREATE_ORDER } from "@/lib/graphql/mutations";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { removeItem, setQuantity, clearCart } from "@/lib/redux/cartSlice";
import { useSession } from "@/lib/useSession";

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
        <h1 className="text-lg font-semibold text-white">Your cart</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Empty.{" "}
          <Link href="/" className="text-indigo-300 hover:underline">
            Browse products →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold text-white">Your cart</h1>

      <div className="mt-6 divide-y divide-white/10 rounded-xl border border-white/10 bg-neutral-900/60">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm text-white">{item.name}</p>
              <p className="text-xs text-neutral-400">${item.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  dispatch(
                    setQuantity({ productId: item.productId, quantity: Number(e.target.value) })
                  )
                }
                className="w-16 rounded-md border border-white/10 bg-neutral-950 px-2 py-1 text-sm text-white"
              />
              <button
                onClick={() => dispatch(removeItem({ productId: item.productId }))}
                className="text-xs text-neutral-500 hover:text-red-400"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-neutral-400">Total</span>
        <span className="text-xl font-semibold text-indigo-300">${total.toFixed(2)}</span>
      </div>

      {!ready ? null : !session ? (
        <p className="mt-6 text-sm text-neutral-400">
          <Link href="/login" className="text-indigo-300 hover:underline">
            Log in
          </Link>{" "}
          to check out — the order service requires a valid JWT.
        </p>
      ) : (
        <button
          onClick={handleCheckout}
          disabled={checkingOut}
          className="mt-6 w-full rounded-md bg-indigo-500 py-2.5 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
        >
          {checkingOut ? "Placing order…" : "Checkout"}
        </button>
      )}
      {checkoutError && <p className="mt-3 text-xs text-red-400">{checkoutError}</p>}
    </div>
  );
}
