import { describe, expect, it } from "vitest";
import reducer, {
  MAX_QTY,
  addItem,
  clearCart,
  hydrateCart,
  removeItem,
  selectCartCount,
  selectCartSubtotal,
  setQuantity,
  type CartState,
} from "./cartSlice";
import { sanitizeCart } from "./store";

const mouse = { productId: "p1", name: "Mouse", price: 25 };
const desk = { productId: "p2", name: "Desk", price: 300 };
const empty: CartState = { items: [], hydrated: true };

describe("cartSlice", () => {
  it("adds a new item with quantity 1", () => {
    const s = reducer(empty, addItem(mouse));
    expect(s.items).toEqual([{ ...mouse, quantity: 1 }]);
  });

  it("increments quantity when the same product is added again", () => {
    let s = reducer(empty, addItem(mouse));
    s = reducer(s, addItem({ ...mouse, quantity: 3 }));
    expect(s.items).toHaveLength(1);
    expect(s.items[0].quantity).toBe(4);
  });

  it("refreshes price/name when the product changed since it was added", () => {
    let s = reducer(empty, addItem(mouse));
    s = reducer(s, addItem({ ...mouse, name: "Mouse Pro", price: 30 }));
    expect(s.items[0]).toMatchObject({ name: "Mouse Pro", price: 30, quantity: 2 });
  });

  it("caps quantity at MAX_QTY", () => {
    let s = reducer(empty, addItem({ ...mouse, quantity: MAX_QTY }));
    s = reducer(s, addItem(mouse));
    expect(s.items[0].quantity).toBe(MAX_QTY);
  });

  it("setQuantity updates, and removes the line at 0 or below", () => {
    let s = reducer(empty, addItem(mouse));
    s = reducer(s, setQuantity({ productId: "p1", quantity: 5 }));
    expect(s.items[0].quantity).toBe(5);
    s = reducer(s, setQuantity({ productId: "p1", quantity: 0 }));
    expect(s.items).toEqual([]);
  });

  it("ignores setQuantity for unknown products", () => {
    const s = reducer(empty, setQuantity({ productId: "nope", quantity: 3 }));
    expect(s.items).toEqual([]);
  });

  it("removes and clears", () => {
    let s = reducer(empty, addItem(mouse));
    s = reducer(s, addItem(desk));
    s = reducer(s, removeItem({ productId: "p1" }));
    expect(s.items.map((i) => i.productId)).toEqual(["p2"]);
    s = reducer(s, clearCart());
    expect(s.items).toEqual([]);
  });

  it("hydrate sets items and marks the cart hydrated", () => {
    const s = reducer({ items: [], hydrated: false }, hydrateCart([{ ...mouse, quantity: 2 }]));
    expect(s.hydrated).toBe(true);
    expect(s.items[0].quantity).toBe(2);
  });

  it("selectors compute count and subtotal", () => {
    let s = reducer(empty, addItem({ ...mouse, quantity: 2 }));
    s = reducer(s, addItem(desk));
    expect(selectCartCount({ cart: s })).toBe(3);
    expect(selectCartSubtotal({ cart: s })).toBe(2 * 25 + 300);
  });
});

describe("sanitizeCart", () => {
  it("drops malformed persisted entries", () => {
    const result = sanitizeCart([
      { productId: "a", name: "ok", price: 1, quantity: 1 },
      { productId: "b", name: "no price", quantity: 1 },
      { productId: "c", name: "zero qty", price: 1, quantity: 0 },
      null,
      "junk",
    ]);
    expect(result.map((i) => i.productId)).toEqual(["a"]);
  });

  it("returns [] for non-arrays", () => {
    expect(sanitizeCart({ not: "an array" })).toEqual([]);
  });
});
