import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type WishlistState = {
  /** Product ids, most recently saved first. */
  ids: string[];
  hydrated: boolean;
};

const initialState: WishlistState = { ids: [], hydrated: false };

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    hydrateWishlist(state, action: PayloadAction<string[]>) {
      state.ids = action.payload;
      state.hydrated = true;
    },
    toggleWishlist(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.ids = state.ids.includes(id)
        ? state.ids.filter((x) => x !== id)
        : [id, ...state.ids];
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.ids = state.ids.filter((x) => x !== action.payload);
    },
  },
});

export const { hydrateWishlist, toggleWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
