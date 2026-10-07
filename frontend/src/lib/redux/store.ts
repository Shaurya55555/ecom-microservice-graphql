import { configureStore } from "@reduxjs/toolkit";
import cartReducer, { type CartItem } from "./cartSlice";
import wishlistReducer from "./wishlistSlice";

export const CART_KEY = "ecom_cart";
export const WISHLIST_KEY = "ecom_wishlist";

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked (private mode) — the cart still works in memory.
  }
}

/** Guards against stale/corrupt persisted data from older app versions. */
export function sanitizeCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (i): i is CartItem =>
      !!i &&
      typeof i.productId === "string" &&
      typeof i.name === "string" &&
      typeof i.price === "number" &&
      Number.isFinite(i.quantity) &&
      i.quantity > 0
  );
}

export function makeStore() {
  return configureStore({
    reducer: { cart: cartReducer, wishlist: wishlistReducer },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
