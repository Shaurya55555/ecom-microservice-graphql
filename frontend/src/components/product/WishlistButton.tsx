"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { toggleWishlist } from "@/lib/redux/wishlistSlice";
import { haptic } from "@/lib/device";
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
        haptic(10);
        // Un-saving is the destructive direction, so it gets an Undo.
        if (saved) {
          toast("Removed from wishlist", {
            action: { label: "Undo", onClick: () => dispatch(toggleWishlist(productId)) },
          });
        } else {
          toast("Saved to wishlist");
        }
      }}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors hover:text-brand",
        saved && "text-brand",
        className
      )}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-current")} strokeWidth={1.75} aria-hidden />
    </button>
  );
}
