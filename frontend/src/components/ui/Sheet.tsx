"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { shouldDismiss } from "@/lib/gestures";

type Side = "right" | "bottom";

/**
 * A slide-over panel (right on desktop, bottom on phones) on the native <dialog> element, so focus
 * trapping, Escape and the backdrop come for free. On touch it can be dragged away: grab the header
 * and pull it toward the edge it came from, either far enough or fast enough, and it closes.
 */
export function Sheet({
  open,
  onClose,
  side,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  side: Side;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ start: number; t: number; id: number } | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const axis = side === "bottom" ? "clientY" : "clientX";
  const translate = (px: number) => (side === "bottom" ? `translateY(${px}px)` : `translateX(${px}px)`);

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button")) return; // let the close button be a normal click
    drag.current = { start: e[axis], t: performance.now(), id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
    if (ref.current) ref.current.style.transition = "none";
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !ref.current) return;
    const dist = Math.max(e[axis] - drag.current.start, 0); // only toward the closing edge
    ref.current.style.transform = translate(dist);
  }

  function onPointerEnd(e: React.PointerEvent) {
    const d = drag.current;
    const el = ref.current;
    drag.current = null;
    if (!d || !el) return;
    const dist = Math.max(e[axis] - d.start, 0);
    el.style.transition = "transform 180ms ease-out";
    if (shouldDismiss(dist, performance.now() - d.t)) {
      el.style.transform = translate(side === "bottom" ? el.offsetHeight : el.offsetWidth);
      window.setTimeout(() => {
        onClose();
        el.style.transform = "";
        el.style.transition = "";
      }, 160);
    } else {
      el.style.transform = "";
    }
  }

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        // `flex` must only apply while open: a bare `flex` class would override the browser's
        // `dialog:not([open]) { display: none }` and leave a closed sheet covering the page.
        "fixed m-0 max-h-none flex-col overflow-hidden bg-surface p-0 text-fg shadow-[var(--shadow-lift)] open:flex",
        "border-line open:animate-[sheet-in_220ms_ease-out]",
        side === "right"
          ? "inset-y-0 left-auto right-0 h-full w-[min(26rem,100vw)] border-l [--sheet-from:100%_0]"
          : "inset-x-0 bottom-0 top-auto h-auto max-h-[88vh] w-full rounded-t-xl border-t [--sheet-from:0_100%]"
      )}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        style={{ touchAction: side === "bottom" ? "pan-x" : "pan-y" }}
        className="shrink-0 cursor-grab select-none border-b border-line active:cursor-grabbing"
      >
        {side === "bottom" && (
          <div className="flex justify-center pt-2.5" aria-hidden>
            <span className="h-1 w-10 rounded-full bg-line-strong" />
          </div>
        )}
        <div className="flex items-center justify-between px-5 py-3.5">
          <h2 className="font-serif text-lg font-medium">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title.toLowerCase()}`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      {footer && <div className="shrink-0 border-t border-line bg-surface p-4">{footer}</div>}
    </dialog>
  );
}
