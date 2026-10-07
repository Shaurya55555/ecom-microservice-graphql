"use client";

import { useSyncExternalStore } from "react";

/** A tiny tap of vibration on phones that support it (no-op everywhere else). */
export function haptic(ms = 10) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(ms);
  } catch {
    // Some browsers throw when vibration is blocked by a permissions policy.
  }
}

/** Live `matchMedia` result; false during SSR so the server and first client render agree. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** True when the primary input is a finger (used to tune hints like "press / to search"). */
export function useIsTouch() {
  return useMediaQuery("(pointer: coarse)");
}
