"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { dragIntent, rubberBand, swipeProgress } from "@/lib/gestures";
import { haptic } from "@/lib/device";

/**
 * Swipe a row left to remove it (touch or mouse). A short swipe springs back; past the threshold the
 * row slides away and `onRemove` fires. The row's own buttons keep working, and a visible delete
 * button should still exist for keyboard and screen-reader users — this is a shortcut, not the only way.
 */
export function SwipeToRemove({
  onRemove,
  label = "Remove",
  children,
  className,
}: {
  onRemove: () => void;
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [dx, setDx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const state = useRef<{ x: number; y: number; id: number; intent: "horizontal" | "vertical" | null; moved: boolean } | null>(null);
  const crossed = useRef(false);
  // Stays true after release so the click that follows a drag can be swallowed.
  const dragged = useRef(false);

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    state.current = { x: e.clientX, y: e.clientY, id: e.pointerId, intent: null, moved: false };
    crossed.current = false;
    dragged.current = false;
    setAnimating(false);
  }

  function onPointerMove(e: React.PointerEvent) {
    const s = state.current;
    if (!s || s.id !== e.pointerId) return;
    const rawX = e.clientX - s.x;
    const rawY = e.clientY - s.y;
    if (!s.intent) {
      s.intent = dragIntent(rawX, rawY);
      if (s.intent === "horizontal") e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (s.intent !== "horizontal") return; // vertical = the user is scrolling the page
    s.moved = true;
    dragged.current = true;
    const next = rubberBand(Math.min(rawX, 0)); // left only
    setDx(next);
    const over = swipeProgress(next) >= 1;
    if (over && !crossed.current) haptic(8); // a small tick when it will commit
    crossed.current = over;
  }

  function end(e: React.PointerEvent) {
    const s = state.current;
    state.current = null;
    if (!s || s.id !== e.pointerId || s.intent !== "horizontal") return;
    setAnimating(true);
    if (swipeProgress(dx) >= 1) {
      setDx(-window.innerWidth);
      window.setTimeout(onRemove, 160);
    } else {
      setDx(0);
    }
  }

  const progress = swipeProgress(dx);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 flex items-center justify-end bg-danger pr-6 text-brand-fg"
        style={{ width: "100%", opacity: Math.min(progress * 1.4, 1) }}
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <Trash2 className="h-4 w-4" strokeWidth={2} />
          {label}
        </span>
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
        onClickCapture={(e) => {
          // A drag that ends over a link/button must not also count as a click on it.
          if (dragged.current) {
            e.stopPropagation();
            e.preventDefault();
            dragged.current = false;
          }
        }}
        style={{
          transform: `translateX(${dx}px)`,
          transition: animating ? "transform 180ms ease-out" : "none",
          touchAction: "pan-y",
        }}
        className="relative bg-surface"
      >
        {children}
      </div>
    </div>
  );
}
