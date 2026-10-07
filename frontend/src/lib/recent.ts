"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { readStorage, writeStorage } from "./redux/store";

const KEY = "ecom_recent";
const EVENT = "ecom-recent-changed";
const MAX = 8;

/** Most recent first, de-duplicated, capped. Pure so it can be unit tested. */
export function pushRecent(ids: string[], id: string, max = MAX): string[] {
  return [id, ...ids.filter((x) => x !== id)].slice(0, max);
}

function readRaw(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function parse(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Recently viewed product ids plus a recorder. SSR-safe (empty on the server). */
export function useRecentlyViewed() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const record = useCallback((id: string) => {
    writeStorage(KEY, pushRecent(readStorage<string[]>(KEY, []), id));
    window.dispatchEvent(new Event(EVENT));
  }, []);
  const ids = useMemo(() => parse(raw), [raw]);
  return { ids, record };
}
