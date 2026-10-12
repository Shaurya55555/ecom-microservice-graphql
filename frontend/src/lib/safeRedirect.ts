/**
 * Only allow same-origin relative paths for post-login redirects.
 * Rejects absolute URLs ("https://evil.com"), protocol-relative ("//evil.com")
 * and backslash tricks ("/\\evil.com").
 */
export function safeRedirect(target: string | null | undefined, fallback: string) {
  if (!target) return fallback;
  if (!target.startsWith("/") || target.startsWith("//") || target.includes("\\")) return fallback;
  return target;
}
