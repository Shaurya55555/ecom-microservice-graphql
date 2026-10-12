"use client";

import { useRef, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { toggleWishlist } from "@/lib/redux/wishlistSlice";
import { isDoubleTap, type TapPoint } from "@/lib/gestures";
import { haptic } from "@/lib/device";

/**
 * Double-tap (touch) or double-click (mouse) anywhere on the photo to save the product, with a
 * heart that pops where you tapped. The heart button next to the title does the same for people who
 * don't know the gesture, so this is a shortcut rather than the only route.
 */
export function DoubleTapToSave({
  productId,
  name,
  children,
}: {
  productId: string;
  name: string;
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const saved = useAppSelector((s) => s.wishlist.ids.includes(productId));
  const last = useRef<TapPoint | null>(null);
  const [pop, setPop] = useState<{ x: number; y: number; key: number } | null>(null);

  const lastFire = useRef(0);

  function fire(x: number, y: number, rect: DOMRect) {
    lastFire.current = performance.now();
    dispatch(toggleWishlist(productId));
    haptic(12);
    setPop({ x: x - rect.left, y: y - rect.top, key: Date.now() });
    toast(saved ? `Removed ${name} from your wishlist` : `Saved ${name} to your wishlist`);
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse") return; // mouse uses the native dblclick below
    const point = { t: e.timeStamp, x: e.clientX, y: e.clientY };
    if (isDoubleTap(last.current, point)) {
      last.current = null;
      fire(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
    } else {
      last.current = point;
    }
  }

  return (
    <div
      onPointerUp={onPointerUp}
      onDoubleClick={(e) => {
        // Touch browsers may also synthesise a dblclick after the double-tap handled above.
        if (performance.now() - lastFire.current < 600) return;
        fire(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
      }}
      // `manipulation` lets taps through without the browser's own double-tap-to-zoom delay.
      style={{ touchAction: "manipulation" }}
      className="relative select-none"
    >
      {children}
      {pop && (
        <Heart
          key={pop.key}
          aria-hidden
          onAnimationEnd={() => setPop(null)}
          className="animate-heart-pop pointer-events-none absolute h-20 w-20 fill-brand text-brand drop-shadow"
          style={{ left: pop.x, top: pop.y }}
        />
      )}
    </div>
  );
}
