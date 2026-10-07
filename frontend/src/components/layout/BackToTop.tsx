"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Appears after scrolling a couple of screens; mostly useful on long mobile lists. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-5 right-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface text-fg shadow-[var(--shadow-lift)] transition-colors hover:bg-surface-2 max-md:bottom-24"
    >
      <ArrowUp className="h-4 w-4" strokeWidth={2} aria-hidden />
    </button>
  );
}
