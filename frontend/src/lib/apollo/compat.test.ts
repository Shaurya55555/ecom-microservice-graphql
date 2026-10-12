import { beforeEach, describe, expect, it } from "vitest";
import { ApolloLink, gql } from "@apollo/client";
import { print } from "graphql";
import { Observable, firstValueFrom } from "rxjs";
import {
  compatLink,
  isLegacyGateway,
  isUnsupportedFieldFailure,
  resetCompat,
  stripOptionalFields,
} from "./compat";
import { friendlyError } from "../utils";

const PRODUCTS = gql`
  fragment F on Product {
    id
    name
    category
    imageUrl
    createdAt
  }
  query Q {
    getProducts {
      ...F
    }
  }
`;

const CREATE = gql`
  mutation C($name: String!, $category: String, $imageUrl: String) {
    createProduct(name: $name, category: $category, imageUrl: $imageUrl) {
      id
      category
    }
  }
`;

describe("stripOptionalFields", () => {
  it("removes the new fields from selections and fragments but keeps the rest", () => {
    const out = print(stripOptionalFields(PRODUCTS));
    expect(out).not.toMatch(/category|imageUrl|createdAt/);
    expect(out).toMatch(/id/);
    expect(out).toMatch(/name/);
  });

  it("removes matching mutation arguments and variable definitions", () => {
    const out = print(stripOptionalFields(CREATE));
    expect(out).not.toMatch(/category|imageUrl/);
    expect(out).toContain("$name: String!");
    expect(out).toContain("createProduct(name: $name)");
  });
});

describe("isUnsupportedFieldFailure", () => {
  it("recognises a 200-style result with validation errors", () => {
    expect(
      isUnsupportedFieldFailure({ errors: [{ message: 'Cannot query field "category" on type "Product".' }] })
    ).toBe(true);
  });

  it("recognises a thrown 400 ServerError carrying the JSON body", () => {
    const err = Object.assign(new Error("Response not successful: Received status code 400"), {
      bodyText: '{"errors":[{"message":"Cannot query field \\"createdAt\\" on type \\"Product\\"."}]}',
    });
    expect(isUnsupportedFieldFailure(err)).toBe(true);
  });

  it("recognises unknown mutation arguments", () => {
    expect(
      isUnsupportedFieldFailure({ errors: [{ message: 'Unknown argument "imageUrl" on field "Mutation.createProduct".' }] })
    ).toBe(true);
  });

  it("ignores unrelated failures", () => {
    expect(isUnsupportedFieldFailure({ errors: [{ message: "Request failed with status code 401" }] })).toBe(false);
    expect(isUnsupportedFieldFailure(new Error("Failed to fetch"))).toBe(false);
    expect(isUnsupportedFieldFailure(null)).toBe(false);
  });
});

/** A fake gateway that behaves like the pre-category one. */
function oldGateway(mode: "result" | "throw") {
  const seen: string[] = [];
  const terminating = new ApolloLink(
    (op) =>
      new Observable((sub) => {
        const q = print(op.query);
        seen.push(q);
        if (/category|imageUrl|createdAt/.test(q)) {
          const message = 'Cannot query field "category" on type "Product".';
          if (mode === "throw") {
            sub.error(Object.assign(new Error("Response not successful: Received status code 400"), {
              bodyText: JSON.stringify({ errors: [{ message }] }),
            }));
          } else {
            sub.next({ errors: [{ message }] } as never);
            sub.complete();
          }
          return;
        }
        sub.next({ data: { getProducts: [{ id: "1", name: "Mouse" }] } });
        sub.complete();
      })
  );
  return { link: ApolloLink.from([compatLink, terminating]), seen };
}

describe("compatLink against an old gateway", () => {
  beforeEach(() => resetCompat());

  for (const mode of ["result", "throw"] as const) {
    it(`retries once without the new fields (${mode})`, async () => {
      const { link, seen } = oldGateway(mode);
      const result = await firstValueFrom(ApolloLink.execute(link, { query: PRODUCTS }, { client: undefined as never }));
      expect(result).toEqual({ data: { getProducts: [{ id: "1", name: "Mouse" }] } });
      expect(seen).toHaveLength(2); // original attempt + stripped retry
      expect(isLegacyGateway()).toBe(true);
    });

    it(`strips up front afterwards, with no wasted round trip (${mode})`, async () => {
      const { link, seen } = oldGateway(mode);
      await firstValueFrom(ApolloLink.execute(link, { query: PRODUCTS }, { client: undefined as never }));
      seen.length = 0;
      await firstValueFrom(ApolloLink.execute(link, { query: PRODUCTS }, { client: undefined as never }));
      expect(seen).toHaveLength(1);
      expect(seen[0]).not.toMatch(/category/);
    });
  }

  it("remembers the detection for the browser session", async () => {
    const { link } = oldGateway("throw");
    await firstValueFrom(ApolloLink.execute(link, { query: PRODUCTS }, { client: undefined as never }));
    expect(window.sessionStorage.getItem("ecom_legacy_gateway")).toBe("1");
  });

  it("leaves an up-to-date gateway completely alone", async () => {
    const seen: string[] = [];
    const modern = ApolloLink.from([
      compatLink,
      new ApolloLink(
        (op) =>
          new Observable((sub) => {
            seen.push(print(op.query));
            sub.next({ data: { getProducts: [{ id: "1", name: "Mouse", category: "Home" }] } });
            sub.complete();
          })
      ),
    ]);
    const result = await firstValueFrom(ApolloLink.execute(modern, { query: PRODUCTS }, { client: undefined as never }));
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatch(/category/);
    expect(result).toEqual({ data: { getProducts: [{ id: "1", name: "Mouse", category: "Home" }] } });
    expect(isLegacyGateway()).toBe(false);
  });

  it("does not swallow unrelated errors", async () => {
    const failing = ApolloLink.from([
      compatLink,
      new ApolloLink(() => new Observable((sub) => sub.error(new Error("Failed to fetch")))),
    ]);
    await expect(
      firstValueFrom(ApolloLink.execute(failing, { query: PRODUCTS }, { client: undefined as never }))
    ).rejects.toThrow("Failed to fetch");
    expect(isLegacyGateway()).toBe(false);
  });
});

describe("friendlyError for unsupported edit/delete", () => {
  it("explains it instead of showing a generic 400 message", () => {
    const err = Object.assign(new Error("Response not successful: Received status code 400"), {
      bodyText: '{"errors":[{"message":"Cannot query field \\"updateProduct\\" on type \\"Mutation\\"."}]}',
    });
    expect(friendlyError(err)).toMatch(/isn't available on this backend yet/);
  });
});
