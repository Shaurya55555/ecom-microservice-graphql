"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { toggleWishlist } from "@/lib/redux/wishlistSlice";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  name,
  className,
}: {
  productId: string;
  name: string;
  className?: string;
}) {
  const dispatch = useAppDispatch();
  const saved = useAppSelector((s) => s.wishlist.ids.includes(productId));

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      onClick={(e) => {
        // The card is wrapped in a link; don't navigate when saving.
        e.preventDefault();
        e.stopPropagation();
        dispatch(toggleWishlist(productId));
        toast(saved ? "Removed from wishlist" : "Saved to wishlist");
      }}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface/90 shadow-sm backdrop-blur transition-all hover:scale-105",
        saved ? "text-rose-500" : "text-muted hover:text-rose-500",
        className
      )}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-current")} strokeWidth={2} aria-hidden />
    </button>
  );
}
