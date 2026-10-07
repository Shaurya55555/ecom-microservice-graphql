"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAppDispatch } from "@/lib/redux/hooks";
import { addItem } from "@/lib/redux/cartSlice";
import { openCart } from "@/lib/redux/uiSlice";
import { haptic } from "@/lib/device";
import type { Product } from "@/lib/types";

/** Puts the same product (and quantity) from a past order back in the cart and opens it. */
export function BuyAgainButton({
  product,
  quantity = 1,
  variant = "secondary",
}: {
  product: Product;
  quantity?: number;
  variant?: "secondary" | "primary";
}) {
  const dispatch = useAppDispatch();
  return (
    <Button
      size="sm"
      variant={variant}
      aria-label={`Buy ${product.name} again`}
      onClick={() => {
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
        dispatch(openCart());
      }}
    >
      <RotateCw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      Buy again
    </Button>
  );
}
