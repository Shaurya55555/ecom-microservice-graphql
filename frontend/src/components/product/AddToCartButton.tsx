"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAppDispatch } from "@/lib/redux/hooks";
import { addItem } from "@/lib/redux/cartSlice";
import type { Product } from "@/lib/types";

export function AddToCartButton({
  product,
  quantity = 1,
  size = "md",
  fullWidth = false,
  label = "Add to cart",
}: {
  product: Product;
  quantity?: number;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  label?: string;
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
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
    toast.success(`${product.name} added to cart`, {
      action: { label: "View cart", onClick: () => router.push("/cart") },
    });
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
