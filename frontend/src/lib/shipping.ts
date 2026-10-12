import type { ShippingValues } from "./validation/schemas";
import { readStorage, writeStorage } from "./redux/store";

const KEY = "ecom_shipping";
const ORDER_KEY = "ecom_order_shipping";

/**
 * The order service has no address field, so the shipping address is a
 * client-side convenience: remembered locally and shown on the order page.
 */
export function loadShipping(): Partial<ShippingValues> {
  return readStorage<Partial<ShippingValues>>(KEY, {});
}

export function saveShipping(values: ShippingValues) {
  writeStorage(KEY, values);
}

export function saveOrderShipping(orderIds: string[], values: ShippingValues) {
  const all = readStorage<Record<string, ShippingValues>>(ORDER_KEY, {});
  for (const id of orderIds) all[id] = values;
  writeStorage(ORDER_KEY, all);
}

export function loadOrderShipping(orderId: string): ShippingValues | null {
  return readStorage<Record<string, ShippingValues>>(ORDER_KEY, {})[orderId] ?? null;
}
