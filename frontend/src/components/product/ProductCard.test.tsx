import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithStore } from "@/test/renderWithStore";
import { ProductCard } from "./ProductCard";
import { saveSession } from "@/lib/auth";
import type { Product } from "@/lib/types";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }));

const product: Product = {
  id: "p1",
  name: "Aurora Headphones",
  description: "Noise cancelling.",
  price: 129.99,
  category: "Electronics",
  createdAt: new Date().toISOString(),
};

describe("<ProductCard />", () => {
  beforeEach(() => window.localStorage.clear());

  it("shows name, category, formatted price and links to the product", () => {
    renderWithStore(<ProductCard product={product} />);
    expect(screen.getByRole("link", { name: "Aurora Headphones" })).toHaveAttribute("href", "/products/p1");
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("$129.99")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("adds to the cart without navigating", async () => {
    const { store } = renderWithStore(<ProductCard product={product} />);
    await userEvent.click(await screen.findByRole("button", { name: /add/i }));
    expect(store.getState().cart.items).toEqual([
      expect.objectContaining({ productId: "p1", price: 129.99, quantity: 1 }),
    ]);
  });

  it("toggles the wishlist", async () => {
    const { store } = renderWithStore(<ProductCard product={product} />);
    const heart = screen.getByRole("button", { name: /save aurora headphones/i });
    expect(heart).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(heart);
    expect(store.getState().wishlist.ids).toEqual(["p1"]);
    expect(await screen.findByRole("button", { name: /remove aurora headphones/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("hides add-to-cart for seller accounts", async () => {
    saveSession({ token: "t", userId: "u1", username: "maya", email: "m@x.co", role: "seller" });
    renderWithStore(<ProductCard product={product} />);
    // Session is read after mount; wait for the effect to flush.
    await screen.findByRole("link", { name: "Aurora Headphones" });
    expect(screen.queryByRole("button", { name: /add/i })).not.toBeInTheDocument();
  });
});
