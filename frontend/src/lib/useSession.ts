"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getRawSession, parseSession, SESSION_EVENT, type Session } from "./auth";

function subscribe(onChange: () => void) {
  window.addEventListener(SESSION_EVENT, onChange);
  window.addEventListener("storage", onChange); // other tabs
  return () => {
    window.removeEventListener(SESSION_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const noopSubscribe = () => () => {};

/**
 * The stored session, kept in sync across tabs and in-app login/logout.
 * `ready` is false on the server and during hydration (localStorage isn't
 * available there), so UI can avoid flashing the logged-out state.
 */
export function useSession(): { session: Session | null; ready: boolean } {
  const raw = useSyncExternalStore(subscribe, getRawSession, () => null);
  const ready = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const session = useMemo(() => parseSession(raw), [raw]);
  return { session, ready };
}
