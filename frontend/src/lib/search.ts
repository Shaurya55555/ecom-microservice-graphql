import type { Product } from "./types";

/**
 * Ranked suggestions for the header search: names that start with the query first, then names that
 * contain it, then matches on description/category. Pure, so it's unit tested.
 */
export function suggest(products: Product[], query: string, limit = 5): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { p: Product; score: number }[] = [];
  for (const p of products) {
    const name = p.name.toLowerCase();
    let score = 0;
    if (name.startsWith(q)) score = 3;
    else if (name.split(/\s+/).some((w) => w.startsWith(q))) score = 2.5;
    else if (name.includes(q)) score = 2;
    else if (`${p.category ?? ""} ${p.description}`.toLowerCase().includes(q)) score = 1;
    if (score) scored.push({ p, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name))
    .slice(0, limit)
    .map((s) => s.p);
}
