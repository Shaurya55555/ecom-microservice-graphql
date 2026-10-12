"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LogOut, Menu, ShoppingBag } from "lucide-react";
import { useSession } from "@/lib/useSession";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCartCount } from "@/lib/redux/cartSlice";
import { clearSession, LANDING_PAGE } from "@/lib/auth";
import { Badge, ROLE_VARIANT } from "@/components/ui/Badge";
import { Sheet } from "@/components/ui/Sheet";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { buttonStyles } from "@/components/ui/Button";
import { SearchBox } from "./SearchBox";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  active,
  children,
  onClick,
  className,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "border-b-2 py-1 text-sm font-medium transition-colors",
        active ? "border-brand text-fg" : "border-transparent text-muted hover:text-fg",
        className
      )}
    >
      {children}
    </Link>
  );
}

function IconLink({
  href,
  label,
  count,
  children,
}: {
  href: string;
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={count ? `${label} (${count})` : label}
      className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      {children}
      {!!count && (
        // Re-keyed on the count so it nudges every time an item is added.
        <span
          key={count}
          aria-hidden
          className="animate-bump absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-fg"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export function Header() {
  const { session, ready } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const cartCount = useAppSelector(selectCartCount);
  const wishCount = useAppSelector((s) => s.wishlist.ids.length);
  const [menuOpen, setMenuOpen] = useState(false);

  const isBuyer = !session || session.role === "user";
  const closeMenu = () => setMenuOpen(false);

  function handleLogout() {
    clearSession();
    closeMenu();
    router.push("/");
  }

  const roleLink =
    session?.role === "seller"
      ? { href: "/sell", label: "Sell" }
      : session?.role === "admin"
        ? { href: "/admin", label: "Admin" }
        : null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="font-serif text-xl font-medium tracking-tight text-fg">
          Ecom<span className="text-brand">.</span>store
        </Link>

        <nav aria-label="Primary" className="ml-4 hidden items-center gap-6 lg:flex">
          <NavLink href="/" active={pathname === "/"}>
            Home
          </NavLink>
          <NavLink href="/products" active={pathname.startsWith("/products")}>
            Shop
          </NavLink>
          {roleLink && (
            <NavLink href={roleLink.href} active={pathname.startsWith(roleLink.href)}>
              {roleLink.label}
            </NavLink>
          )}
        </nav>

        <SearchBox shortcut className="mx-auto hidden max-w-md flex-1 md:block" />

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <ThemeToggle />
          {isBuyer && (
            <>
              <IconLink href="/wishlist" label="Wishlist" count={wishCount}>
                <Heart className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
              </IconLink>
              <IconLink href="/cart" label="Cart" count={cartCount}>
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
              </IconLink>
            </>
          )}

          <div className="ml-2 hidden items-center gap-2 border-l border-line pl-4 lg:flex">
            {ready && session ? (
              <>
                <Link
                  href={LANDING_PAGE[session.role] ?? "/account"}
                  className="text-sm text-muted hover:text-fg"
                >
                  {session.username}
                </Link>
                <Badge variant={ROLE_VARIANT[session.role] ?? "neutral"}>{session.role}</Badge>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </button>
              </>
            ) : ready ? (
              <>
                <Link href="/login" className={buttonStyles({ variant: "ghost", size: "sm" })}>
                  Log in
                </Link>
                <Link href="/signup" className={buttonStyles({ size: "sm" })}>
                  Sign up
                </Link>
              </>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg lg:hidden"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <Sheet open={menuOpen} onClose={closeMenu} side="right" title="Menu">
        <div className="space-y-6 p-5">
          <SearchBox onNavigate={closeMenu} className="md:hidden" />
          <nav aria-label="Mobile" className="flex flex-col">
            {[
              { href: "/", label: "Home", active: pathname === "/" },
              { href: "/products", label: "Shop", active: pathname.startsWith("/products") },
              ...(roleLink
                ? [{ ...roleLink, active: pathname.startsWith(roleLink.href) }]
                : []),
              ...(ready && session
                ? [
                    {
                      href: LANDING_PAGE[session.role] ?? "/account",
                      label: session.role === "user" ? "My orders" : "Dashboard",
                      active: false,
                    },
                  ]
                : []),
            ].map((l) => (
              <NavLink
                key={l.href + l.label}
                href={l.href}
                active={l.active}
                onClick={closeMenu}
                className="border-b border-line py-3.5 font-serif text-xl font-normal"
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          {ready && session ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">
                {session.username} <Badge variant={ROLE_VARIANT[session.role] ?? "neutral"}>{session.role}</Badge>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-danger"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                Log out
              </button>
            </div>
          ) : ready ? (
            <div className="flex gap-2">
              <Link
                href="/login"
                onClick={closeMenu}
                className={buttonStyles({ variant: "secondary", className: "flex-1" })}
              >
                Log in
              </Link>
              <Link href="/signup" onClick={closeMenu} className={buttonStyles({ className: "flex-1" })}>
                Sign up
              </Link>
            </div>
          ) : null}
        </div>
      </Sheet>
    </header>
  );
}
