"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { SwipeToRemove } from "@/components/ui/SwipeToRemove";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ProductImage } from "@/components/product/ProductImage";
import { buttonStyles } from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  addItem,
  selectCartCount,
  selectCartItems,
  selectCartSubtotal,
  setQuantity,
  type CartItem,
} from "@/lib/redux/cartSlice";
import { closeCart } from "@/lib/redux/uiSlice";
import { useMediaQuery } from "@/lib/device";
import { useSession } from "@/lib/useSession";
import { useCartActions } from "@/lib/useCartActions";
import { formatPrice, pluralize } from "@/lib/utils";

/**
 * The slide-over cart that opens after "Add to cart" on a product page. Right-hand panel on wide
 * screens, bottom sheet on phones. Rows can be swiped away (with Undo), and the whole sheet can be
 * dragged closed.
 */
export function CartDrawer() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.cartOpen);
  const items = useAppSelector(selectCartItems);
  const count = useAppSelector(selectCartCount);
  const subtotal = useAppSelector(selectCartSubtotal);
  const wide = useMediaQuery("(min-width: 768px)");
  const pathname = usePathname();
  const { session } = useSession();
  const { removeWithUndo } = useCartActions();
  const close = () => dispatch(closeCart());

  // Inline "Undo" for removals made inside the drawer (toasts can't be reached while it's modal).
  const [removed, setRemoved] = useState<CartItem | null>(null);
  const undoTimer = useRef<number | undefined>(undefined);
  function remove(item: CartItem) {
    removeWithUndo(item, { silent: true });
    setRemoved(item);
    window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(() => setRemoved(null), 6000);
  }
  function undoRemove() {
    if (!removed) return;
    dispatch(addItem(removed));
    window.clearTimeout(undoTimer.current);
    setRemoved(null);
  }
  // Only ever shown while the drawer is open; the 6s timer clears the leftover state.
  const shownRemoval = open ? removed : null;

  // Navigating anywhere (including the browser back button) closes it.
  useEffect(() => {
    dispatch(closeCart());
  }, [pathname, dispatch]);

  return (
    <Sheet
      open={open}
      onClose={close}
      side={wide ? "right" : "bottom"}
      title={`Your cart${count ? ` (${count})` : ""}`}
      footer={
        items.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted">Subtotal · {pluralize(count, "item")}</span>
              <span className="text-lg font-semibold tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <Link
              href={session ? "/checkout" : "/login?next=/checkout"}
              onClick={close}
              className={buttonStyles({ size: "lg", className: "w-full" })}
            >
              {session ? "Checkout" : "Log in to checkout"}
            </Link>
            <Link
              href="/cart"
              onClick={close}
              className={buttonStyles({ variant: "secondary", className: "w-full" })}
            >
              View full cart
            </Link>
          </div>
        )
      }
    >
      {shownRemoval && (
        <div
          role="status"
          className="mx-5 mt-4 flex items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2 text-sm"
        >
          <span className="min-w-0 truncate">Removed {shownRemoval.name}</span>
          <button type="button" onClick={undoRemove} className="shrink-0 font-medium text-brand-text hover:underline">
            Undo
          </button>
        </div>
      )}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <ShoppingBag className="h-8 w-8 text-subtle" strokeWidth={1.25} aria-hidden />
          <p className="font-serif text-lg">Nothing here yet</p>
          <p className="max-w-xs text-sm text-muted">Add a few things and they&apos;ll wait for you here.</p>
          <Link href="/products" onClick={close} className={buttonStyles({ variant: "secondary" })}>
            Browse the shop
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.productId}>
                <SwipeToRemove onRemove={() => remove(item)} label="Remove">
                  <div className="flex items-center gap-3 px-5 py-3.5">
                    <Link href={`/products/${item.productId}`} onClick={close} aria-label={`View ${item.name}`}>
                      <ProductImage
                        src={item.imageUrl}
                        alt=""
                        category={item.category}
                        className="h-16 w-16 shrink-0 rounded-md border border-line"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.productId}`}
                        onClick={close}
                        className="line-clamp-2 text-sm font-medium hover:text-brand-text"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-subtle">{formatPrice(item.price)} each</p>
                      <div className="mt-2 flex items-center justify-between">
                        <QuantityStepper
                          size="sm"
                          label={`${item.name} quantity`}
                          value={item.quantity}
                          onChange={(q) => dispatch(setQuantity({ productId: item.productId, quantity: q }))}
                        />
                        <span className="text-sm font-semibold tabular-nums">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="self-start rounded-md p-1.5 text-subtle hover:bg-danger-soft hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </button>
                  </div>
                </SwipeToRemove>
              </li>
            ))}
          </ul>
          <p className="px-5 py-3 text-center text-xs text-subtle md:hidden">Swipe a row left to remove it</p>
        </>
      )}
    </Sheet>
  );
}
