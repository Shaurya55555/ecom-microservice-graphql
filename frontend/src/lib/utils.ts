import { clsx, type ClassValue } from "clsx";

/** Conditional className joiner. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatPrice(value: number) {
  return priceFormatter.format(value);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Short, human-friendly order reference — the last 6 chars of the Mongo id. */
export function shortId(id: string) {
  return id.slice(-6).toUpperCase();
}

export function formatDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Deterministic 0..(mod-1) hash so a product always gets the same tint/pattern. */
export function hashString(value: string, mod: number) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash % mod;
}

/**
 * The gateway proxies axios errors, so the raw message is often
 * "Request failed with status code 401". Translate those into something a
 * shopper can act on.
 */
export function friendlyError(err: unknown, fallback = "Something went wrong. Please try again.") {
  const message = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  if (!message) return fallback;
  // Apollo’s ServerError keeps the GraphQL error JSON in bodyText (the message is just "status code 400").
  const body = typeof (err as { bodyText?: unknown })?.bodyText === "string" ? (err as { bodyText: string }).bodyText : "";
  if (/Cannot query field \\?"(updateProduct|deleteProduct)\\?"/.test(`${message} ${body}`))
    return "Editing and deleting products isn't available on this backend yet.";
  if (/status code 401/.test(message)) return "Your session has expired or your credentials are invalid.";
  if (/status code 403/.test(message)) return "You don't have permission to do that.";
  if (/status code 404/.test(message)) return "We couldn't find that.";
  if (/status code 409/.test(message)) return "That username or email is already in use.";
  if (/status code 400/.test(message)) return "Some of the details look wrong. Please check and retry.";
  if (/status code 5\d\d/.test(message)) return "The server hit a problem. Please try again shortly.";
  if (/failed to fetch|networkerror|network request failed/i.test(message))
    return "Can't reach the store right now. Check your connection and try again.";
  return message;
}
