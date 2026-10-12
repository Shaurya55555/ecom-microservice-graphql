"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { selectCartItems, setQuantity } from "@/lib/redux/cartSlice";
import { useSession } from "@/lib/useSession";
import { useCartActions } from "@/lib/useCartActions";
import { formatPrice } from "@/lib/utils";
import { Card, PageHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { SwipeToRemove } from "@/components/ui/SwipeToRemove";
import { buttonStyles } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductImage } from "@/components/product/ProductImage";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { LANDING_PAGE } from "@/lib/auth";

export default function CartPage() {
  const items = useAppSelector(selectCartItems);
  const hydrated = useAppSelector((s) => s.cart.hydrated);
  const dispatch = useAppDispatch();
  const { session, ready } = useSession();
  const { removeWithUndo } = useCartActions();

  if (!hydrated || !ready) {
    return (
      <div className="space-y-4" aria-busy>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (session && session.role !== "user") {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Carts are for buyer accounts"
        description={`You're signed in as a ${session.role}.`}
        action={
          <Link href={LANDING_PAGE[session.role]} className={buttonStyles({ variant: "secondary" })}>
            Go to your dashboard
          </Link>
        }
      />
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Your cart" />
        <Card>
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Add something you like and it will wait for you here."
            action={
              <Link href="/products" className={buttonStyles({})}>
                Start shopping
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Your cart"
        description={`${items.length} ${items.length === 1 ? "product" : "products"}`}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <Card className="divide-y divide-line overflow-hidden">
            {items.map((item) => (
              <SwipeToRemove key={item.productId} onRemove={() => removeWithUndo(item)} label="Remove">
                <div className="flex gap-4 p-4 sm:p-5">
                  <Link href={`/products/${item.productId}`} className="shrink-0" aria-label={`View ${item.name}`}>
                    <ProductImage
                      src={item.imageUrl}
                      alt=""
                      category={item.category}
                      className="h-20 w-20 rounded-lg border border-line sm:h-24 sm:w-24"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${item.productId}`}
                        className="line-clamp-2 font-medium text-fg hover:text-brand-text"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-subtle">{formatPrice(item.price)} each</p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <QuantityStepper
                        size="sm"
                        label={`${item.name} quantity`}
                        value={item.quantity}
                        onChange={(q) => dispatch(setQuantity({ productId: item.productId, quantity: q }))}
                      />
                      <span className="w-20 text-right font-semibold tabular-nums text-fg">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeWithUndo(item)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-subtle transition-colors hover:bg-danger-soft hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      </button>
                    </div>
                  </div>
                </div>
              </SwipeToRemove>
            ))}
          </Card>
          <p className="mt-3 text-xs text-subtle md:hidden">Tip: swipe an item to the left to remove it.</p>
        </div>

        <OrderSummary items={items}>
          <Link
            href={session ? "/checkout" : "/login?next=/checkout"}
            className={buttonStyles({ size: "lg", className: "w-full" })}
          >
            {session ? "Checkout" : "Log in to checkout"}
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </Link>
          <Link
            href="/products"
            className="mt-3 block text-center text-sm font-medium text-brand-text hover:underline"
          >
            Keep shopping
          </Link>
        </OrderSummary>
      </div>
    </div>
  );
}
