"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "./redux/hooks";
import { addItem, removeItem, type CartItem } from "./redux/cartSlice";
import { haptic } from "./device";

/** Cart removal that can be taken back: every removal offers an Undo for a few seconds. */
export function useCartActions() {
  const dispatch = useAppDispatch();

  const removeWithUndo = useCallback(
    (item: CartItem, options: { silent?: boolean } = {}) => {
      dispatch(removeItem({ productId: item.productId }));
      haptic(10);
      // `silent` is for the modal cart drawer: a toast would sit behind it, unreachable, so the
      // drawer shows its own inline Undo instead.
      if (options.silent) return;
      toast(`Removed ${item.name}`, {
        action: {
          label: "Undo",
          onClick: () => dispatch(addItem(item)), // addItem takes the stored quantity as-is
        },
      });
    },
    [dispatch]
  );

  return { removeWithUndo };
}
