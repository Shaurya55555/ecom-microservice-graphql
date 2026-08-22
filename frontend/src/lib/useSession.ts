"use client";

import { useEffect, useState } from "react";
import { getSession, type Session } from "./auth";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setReady(true);
    const onChange = () => setSession(getSession());
    window.addEventListener("ecom-session-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("ecom-session-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return { session, ready };
}
