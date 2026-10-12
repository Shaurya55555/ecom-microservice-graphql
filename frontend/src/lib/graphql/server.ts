import type { Product } from "@/lib/types";

export const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:4000/";

const query = (fields: string) => `
  query GetProduct($id: ID!) {
    getProduct(id: $id) { ${fields} }
  }
`;

const FULL_QUERY = query("id name description price sellerId category imageUrl createdAt");
/** For gateways that predate category/imageUrl/createdAt. */
const LEGACY_QUERY = query("id name description price sellerId");

type GqlResponse = { data?: { getProduct: Product | null }; errors?: { message: string }[] };

async function post(queryText: string, id: string): Promise<GqlResponse | null> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: queryText, variables: { id } }),
    next: { revalidate: 30 },
    signal: AbortSignal.timeout(4000),
  });
  // Apollo Server answers validation failures with HTTP 400 *and* a JSON body, so read the body either way.
  return (await res.json().catch(() => null)) as GqlResponse | null;
}

/**
 * Server-side product fetch used for SSR + metadata. Resolves to null on any
 * failure (gateway down, product missing) so the page can fall back to the
 * client-side Apollo query instead of crashing the render. Falls back to a
 * smaller field set when the gateway predates category/imageUrl/createdAt.
 */
export async function fetchProduct(id: string): Promise<Product | null> {
  try {
    let json = await post(FULL_QUERY, id);
    if (json?.errors?.some((e) => /Cannot query field/.test(e.message))) {
      json = await post(LEGACY_QUERY, id);
    }
    return json?.data?.getProduct ?? null;
  } catch {
    return null;
  }
}
