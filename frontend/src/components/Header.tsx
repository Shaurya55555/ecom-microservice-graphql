"use client";

import Link from "next/link";
import { useSession } from "@/lib/useSession";
import { useAppSelector } from "@/lib/redux/hooks";
import { clearSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

const LANDING_PAGE: Record<string, string> = {
  user: "/account",
  seller: "/sell",
  admin: "/admin",
};

export function Header() {
  const { session, ready } = useSession();
  const itemCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const router = useRouter();

  function handleLogout() {
    clearSession();
    router.push("/");
  }

  const isBuyer = !session || session.role === "user";

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight text-white">
          Ecom<span className="text-indigo-400">.</span>store
        </Link>
        <nav className="flex items-center gap-5 text-sm text-neutral-300">
          <Link href="/" className="hover:text-white">
            Catalog
          </Link>
          {isBuyer && (
            <Link href="/cart" className="hover:text-white">
              Cart{itemCount > 0 ? ` (${itemCount})` : ""}
            </Link>
          )}
          {session?.role === "seller" && (
            <Link href="/sell" className="hover:text-white">
              Sell
            </Link>
          )}
          {session?.role === "admin" && (
            <Link href="/admin" className="hover:text-white">
              Admin
            </Link>
          )}
          {ready && session ? (
            <>
              <Link href={LANDING_PAGE[session.role] ?? "/account"} className="hover:text-white">
                {session.username}{" "}
                <span className="text-xs text-neutral-500">({session.role})</span>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-neutral-300 hover:border-white/30 hover:text-white"
              >
                Log out
              </button>
            </>
          ) : ready ? (
            <>
              <Link href="/login" className="hover:text-white">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-400"
              >
                Sign up
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
