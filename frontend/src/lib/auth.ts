export type Role = "user" | "seller" | "admin";

export type Session = {
  token: string;
  userId: string;
  username: string;
  email: string;
  role: Role;
};

const KEY = "ecom_session";
const EVENT = "ecom-session-changed";

export const LANDING_PAGE: Record<Role, string> = {
  user: "/account",
  seller: "/sell",
  admin: "/admin",
};

export function saveSession(session: Session) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(EVENT));
}

/** Raw stored value; a primitive, so it's a stable snapshot for useSyncExternalStore. */
export function getRawSession(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function parseSession(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function getSession(): Session | null {
  return parseSession(getRawSession());
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export const SESSION_EVENT = EVENT;
