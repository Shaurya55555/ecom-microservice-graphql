import { describe, expect, it } from "vitest";
import { loginSchema, productSchema, shippingSchema, signupSchema } from "./schemas";
import { safeRedirect } from "../safeRedirect";
import { friendlyError } from "../utils";

const messages = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues.map((i) => i.message) ?? [];

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });
  it("rejects a bad email", () => {
    expect(messages(loginSchema.safeParse({ email: "nope", password: "x" }))).toContain("Enter a valid email address");
  });
});

describe("signupSchema", () => {
  const valid = {
    username: "maya",
    email: "maya@shop.com",
    password: "hunter22x",
    confirmPassword: "hunter22x",
    role: "seller" as const,
  };
  it("accepts a valid signup", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });
  it("requires matching passwords", () => {
    expect(messages(signupSchema.safeParse({ ...valid, confirmPassword: "different1" }))).toContain("Passwords don't match");
  });
  it("enforces password strength", () => {
    expect(signupSchema.safeParse({ ...valid, password: "short1", confirmPassword: "short1" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...valid, password: "onlyletters", confirmPassword: "onlyletters" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...valid, password: "12345678", confirmPassword: "12345678" }).success).toBe(false);
  });
  it("blocks self-registering as admin", () => {
    expect(signupSchema.safeParse({ ...valid, role: "admin" }).success).toBe(false);
  });
});

describe("shippingSchema", () => {
  const valid = {
    fullName: "Sam Rivera",
    phone: "+1 (555) 123-4567",
    address: "12 Market Street",
    city: "Austin",
    state: "TX",
    postalCode: "78701",
    country: "United States",
  };
  it("accepts a valid address", () => {
    expect(shippingSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects letters in the phone number and a too-short postal code", () => {
    expect(shippingSchema.safeParse({ ...valid, phone: "call me" }).success).toBe(false);
    expect(shippingSchema.safeParse({ ...valid, postalCode: "1" }).success).toBe(false);
  });
});

describe("productSchema", () => {
  const valid = { name: "Desk Lamp", description: "A warm dimmable lamp.", price: "24.99", category: "Home", imageUrl: "" };
  it("accepts a product with no image", () => {
    expect(productSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects zero/negative/NaN prices", () => {
    for (const price of ["0", "-3", "abc", ""]) {
      expect(productSchema.safeParse({ ...valid, price }).success).toBe(false);
    }
  });
  it("only allows http(s) image URLs", () => {
    expect(productSchema.safeParse({ ...valid, imageUrl: "https://x.co/a.png" }).success).toBe(true);
    expect(productSchema.safeParse({ ...valid, imageUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(productSchema.safeParse({ ...valid, imageUrl: "not a url" }).success).toBe(false);
  });
});

describe("safeRedirect", () => {
  it("allows same-origin relative paths", () => {
    expect(safeRedirect("/checkout", "/")).toBe("/checkout");
    expect(safeRedirect("/products?category=Home", "/")).toBe("/products?category=Home");
  });
  it.each(["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", "", null, undefined])(
    "rejects %s",
    (input) => {
      expect(safeRedirect(input as string | null, "/account")).toBe("/account");
    }
  );
});

describe("friendlyError", () => {
  it("translates proxied HTTP errors", () => {
    expect(friendlyError(new Error("Request failed with status code 403"))).toMatch(/permission/);
    expect(friendlyError(new Error("Request failed with status code 409"))).toMatch(/already in use/);
    expect(friendlyError(new Error("Failed to fetch"))).toMatch(/Can't reach/);
  });
  it("passes through unknown messages and falls back when empty", () => {
    expect(friendlyError(new Error("Custom problem"))).toBe("Custom problem");
    expect(friendlyError(undefined, "fallback")).toBe("fallback");
  });
});
