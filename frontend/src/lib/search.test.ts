import { describe, expect, it } from "vitest";
import { suggest } from "./search";
import { pushRecent } from "./recent";
import type { Product } from "./types";

const p = (name: string, over: Partial<Product> = {}): Product => ({
  id: name,
  name,
  description: "A thing",
  price: 10,
  category: "General",
  ...over,
});

const catalog = [
  p("Desk Lamp", { category: "Home" }),
  p("Lamp Shade", { category: "Home" }),
  p("Standing Desk", { category: "Home" }),
  p("Yoga Mat", { description: "Non-slip, lamp-free" }),
  p("Keyboard", { category: "Electronics" }),
];

describe("suggest", () => {
  it("returns nothing for an empty query", () => {
    expect(suggest(catalog, "")).toEqual([]);
    expect(suggest(catalog, "   ")).toEqual([]);
  });

  it("ranks prefix matches above word-start, substring and description matches", () => {
    expect(suggest(catalog, "lamp").map((x) => x.name)).toEqual(["Lamp Shade", "Desk Lamp", "Yoga Mat"]);
  });

  it("is case-insensitive and finds category matches", () => {
    expect(suggest(catalog, "ELECTRON").map((x) => x.name)).toEqual(["Keyboard"]);
  });

  it("respects the limit", () => {
    expect(suggest(catalog, "d", 2)).toHaveLength(2);
  });
});

describe("pushRecent", () => {
  it("puts the newest first and de-duplicates", () => {
    expect(pushRecent(["a", "b", "c"], "b")).toEqual(["b", "a", "c"]);
  });
  it("caps the list", () => {
    expect(pushRecent(["a", "b", "c"], "d", 3)).toEqual(["d", "a", "b"]);
  });
});
