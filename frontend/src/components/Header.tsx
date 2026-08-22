"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, ShoppingCart, Store, ShieldCheck, LogOut, UserCircle2 } from "lucide-react";
import { useSession } from "@/lib/useSession";
import { useAppSelector } from "@/lib/redux/hooks";
import { clearSession } from "@/lib/auth";
import { Badge, ROLE_VARIANT } from "@/components/ui/Badge";

const LANDING_PAGE: Record<string, string> = {
  user: "/account",
  seller: "/sell",
  admin: "/admin",
};

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-white/8 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const { session, ready } = useSession();
  const pathname = usePathname();
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
    <header className="sticky top-0 z-10 border-b border-white/10 bg-neutral-950/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <ShoppingBag className="h-4 w-4 text-white" strokeWidth={2} />
          </span>
          Ecom<span className="text-indigo-400">.</span>store
        </Link>
        <nav className="flex items-center gap-1.5">
          <NavLink href="/" active={pathname === "/"}>
            Catalog
          </NavLink>
          {isBuyer && (
            <NavLink href="/cart" active={pathname === "/cart"}>
              <ShoppingCart className="h-3.5 w-3.5" strokeWidth={2} />
              Cart
              {itemCount > 0 && (
                <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </NavLink>
          )}
          {session?.role === "seller" && (
            <NavLink href="/sell" active={pathname === "/sell"}>
              <Store className="h-3.5 w-3.5" strokeWidth={2} />
              Sell
            </NavLink>
          )}
          {session?.role === "admin" && (
            <NavLink href="/admin" active={pathname === "/admin"}>
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
              Admin
            </NavLink>
          )}

          {ready && session ? (
            <div className="ml-2 flex items-center gap-2 border-l border-white/10 pl-3">
              <Link
                href={LANDING_PAGE[session.role] ?? "/account"}
                className="flex items-center gap-1.5 text-sm text-neutral-300 hover:text-white"
              >
                <UserCircle2 className="h-4 w-4 text-neutral-500" strokeWidth={1.75} />
                {session.username}
              </Link>
              <Badge variant={ROLE_VARIANT[session.role] ?? "neutral"}>{session.role}</Badge>
              <button
                onClick={handleLogout}
                aria-label="Log out"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-neutral-400 hover:border-red-400/40 hover:text-red-400"
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          ) : ready ? (
            <div className="ml-2 flex items-center gap-2 border-l border-white/10 pl-3">
              <Link href="/login" className="px-2 py-1.5 text-sm text-neutral-300 hover:text-white">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-500/30 hover:bg-indigo-400"
              >
                Sign up
              </Link>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
