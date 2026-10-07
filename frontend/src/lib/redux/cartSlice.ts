import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  category?: string | null;
};

export type CartState = {
  items: CartItem[];
  /** False until persisted items have been read from localStorage on the client. */
  hydrated: boolean;
};

export const MAX_QTY = 99;

const initialState: CartState = { items: [], hydrated: false };

const clamp = (n: number) => Math.min(Math.max(Math.floor(n), 0), MAX_QTY);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.hydrated = true;
    },
    addItem(
      state,
      action: PayloadAction<Omit<CartItem, "quantity"> & { quantity?: number }>
    ) {
      const { quantity = 1, ...item } = action.payload;
      const existing = state.items.find((i) => i.productId === item.productId);
      if (existing) {
        existing.quantity = clamp(existing.quantity + quantity);
        // Keep display fields fresh in case the seller edited the product.
        existing.name = item.name;
        existing.price = item.price;
        existing.imageUrl = item.imageUrl;
        existing.category = item.category;
      } else {
        state.items.push({ ...item, quantity: clamp(quantity) || 1 });
      }
    },
    removeItem(state, action: PayloadAction<{ productId: string }>) {
      state.items = state.items.filter((i) => i.productId !== action.payload.productId);
    },
    setQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (!item) return;
      const next = clamp(action.payload.quantity);
      if (next <= 0) {
        state.items = state.items.filter((i) => i.productId !== action.payload.productId);
      } else {
        item.quantity = next;
      }
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { hydrateCart, addItem, removeItem, setQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

type WithCart = { cart: CartState };

export const selectCartItems = (s: WithCart) => s.cart.items;
export const selectCartCount = (s: WithCart) =>
  s.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartSubtotal = (s: WithCart) =>
  s.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
