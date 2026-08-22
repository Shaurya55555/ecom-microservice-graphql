import { configureStore } from "@reduxjs/toolkit";
import cartReducer, { type CartItem } from "./cartSlice";

const CART_KEY = "ecom_cart";

function loadCart(): { items: CartItem[] } | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? { items: JSON.parse(raw) } : undefined;
  } catch {
    return undefined;
  }
}

export function makeStore() {
  const store = configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: loadCart() ?? { items: [] } },
  });

  if (typeof window !== "undefined") {
    store.subscribe(() => {
      window.localStorage.setItem(CART_KEY, JSON.stringify(store.getState().cart.items));
    });
  }

  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
