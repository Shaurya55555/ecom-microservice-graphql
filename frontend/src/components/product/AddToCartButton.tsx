"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAppDispatch } from "@/lib/redux/hooks";
import { addItem, changeQuantity } from "@/lib/redux/cartSlice";
import { openCart } from "@/lib/redux/uiSlice";
import { haptic } from "@/lib/device";
import type { Product } from "@/lib/types";

/**
 * Adds a product to the cart.
 * `feedback="drawer"` slides the mini cart open (product page); `"toast"` stays out of the way for
 * quick multi-adds from a grid, and offers View cart / Undo.
 */
export function AddToCartButton({
  product,
  quantity = 1,
  size = "md",
  fullWidth = false,
  label = "Add to cart",
  feedback = "drawer",
}: {
  product: Product;
  quantity?: number;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  label?: string;
  feedback?: "drawer" | "toast";
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        quantity,
      })
    );
    haptic(12);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);

    if (feedback === "drawer") {
      dispatch(openCart());
    } else {
      toast(`Added ${product.name}`, {
        // Undo reverses only this add, not any earlier quantity of the same product.
        action: {
          label: "Undo",
          onClick: () => dispatch(changeQuantity({ productId: product.id, delta: -quantity })),
        },
        cancel: { label: "View cart", onClick: () => router.push("/cart") },
      });
    }
  }

  return (
    <Button
      onClick={handleAdd}
      size={size}
      variant={justAdded ? "success" : "primary"}
      className={fullWidth ? "w-full" : undefined}
    >
      {justAdded ? (
        <>
          <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          Added
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" strokeWidth={2} aria-hidden />
          {label}
        </>
      )}
    </Button>
  );
}

export function BuyerOnlyNote({ role }: { role: string }) {
  return (
    <p className="text-xs text-subtle">
      Ordering is for buyer accounts. You&apos;re signed in as a {role} —{" "}
      <Link href={role === "seller" ? "/sell" : "/admin"} className="text-brand-text hover:underline">
        open your dashboard
      </Link>
      .
    </p>
  );
}
