"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import {
  CART_KEY,
  WISHLIST_KEY,
  makeStore,
  readStorage,
  sanitizeCart,
  writeStorage,
  type AppStore,
} from "./store";
import { hydrateCart } from "./cartSlice";
import { hydrateWishlist } from "./wishlistSlice";

/**
 * The store starts empty so server HTML and the first client render match.
 * Persisted cart/wishlist are loaded in an effect, then every later change is
 * written back.
 */
export function ReduxWrapper({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(makeStore);

  useEffect(() => {
    store.dispatch(hydrateCart(sanitizeCart(readStorage(CART_KEY, []))));
    const ids = readStorage<unknown>(WISHLIST_KEY, []);
    store.dispatch(
      hydrateWishlist(Array.isArray(ids) ? ids.filter((x): x is string => typeof x === "string") : [])
    );

    const unsubscribe = store.subscribe(() => {
      const { cart, wishlist } = store.getState();
      if (cart.hydrated) writeStorage(CART_KEY, cart.items);
      if (wishlist.hydrated) writeStorage(WISHLIST_KEY, wishlist.ids);
    });

    // Keep multiple tabs in sync.
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) store.dispatch(hydrateCart(sanitizeCart(readStorage(CART_KEY, []))));
    };
    window.addEventListener("storage", onStorage);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
