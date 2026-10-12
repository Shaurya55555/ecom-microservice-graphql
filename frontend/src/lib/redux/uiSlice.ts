import { createSlice } from "@reduxjs/toolkit";

export type UiState = {
  /** The slide-over mini cart. Not persisted. */
  cartOpen: boolean;
};

const uiSlice = createSlice({
  name: "ui",
  initialState: { cartOpen: false } as UiState,
  reducers: {
    openCart(state) {
      state.cartOpen = true;
    },
    closeCart(state) {
      state.cartOpen = false;
    },
  },
});

export const { openCart, closeCart } = uiSlice.actions;
export default uiSlice.reducer;
