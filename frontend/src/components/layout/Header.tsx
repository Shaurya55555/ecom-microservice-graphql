"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  UserCircle2,
  X,
} from "lucide-react";
import { useSession } from "@/lib/useSession";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCartCount } from "@/lib/redux/cartSlice";
import { clearSession, LANDING_PAGE } from "@/lib/auth";
import { Badge, ROLE_VARIANT } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { buttonStyles } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  active,
  children,
  onClick,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg"
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
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      {children}
      {!!count && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-fg"
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
  const [query, setQuery] = useState("");

  const isBuyer = !session || session.role === "user";
  const closeMenu = () => setMenuOpen(false);

  function handleLogout() {
    clearSession();
    closeMenu();
    router.push("/");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    closeMenu();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  const searchForm = (
    <form onSubmit={handleSearch} role="search" className="relative w-full">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
        strokeWidth={2}
        aria-hidden
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products…"
        aria-label="Search products"
        className="h-10 w-full rounded-lg border border-line bg-surface-2 pl-9 pr-3 text-sm text-fg placeholder:text-subtle transition-colors focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
      />
    </form>
  );

  const roleLink =
    session?.role === "seller"
      ? { href: "/sell", label: "Sell", icon: Store }
      : session?.role === "admin"
        ? { href: "/admin", label: "Admin", icon: ShieldCheck }
        : null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight text-fg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
            <ShoppingBag className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
          </span>
          <span className="hidden sm:inline">
            Ecom<span className="text-brand-text">.</span>store
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-2 hidden items-center gap-1 lg:flex">
          <NavLink href="/" active={pathname === "/"}>
            Home
          </NavLink>
          <NavLink href="/products" active={pathname.startsWith("/products")}>
            Shop
          </NavLink>
          {roleLink && (
            <NavLink href={roleLink.href} active={pathname.startsWith(roleLink.href)}>
              <roleLink.icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              {roleLink.label}
            </NavLink>
          )}
        </nav>

        <div className="mx-auto hidden max-w-md flex-1 md:block">{searchForm}</div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <ThemeToggle />
          {isBuyer && (
            <>
              <IconLink href="/wishlist" label="Wishlist" count={wishCount}>
                <Heart className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
              </IconLink>
              <IconLink href="/cart" label="Cart" count={cartCount}>
                <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
              </IconLink>
            </>
          )}

          <div className="ml-1 hidden items-center gap-2 border-l border-line pl-3 lg:flex">
            {ready && session ? (
              <>
                <Link
                  href={LANDING_PAGE[session.role] ?? "/account"}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-fg"
                >
                  <UserCircle2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  {session.username}
                </Link>
                <Badge variant={ROLE_VARIANT[session.role] ?? "neutral"}>{session.role}</Badge>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
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
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="animate-fade-in border-t border-line bg-bg px-4 pb-5 pt-3 lg:hidden">
          <div className="mb-3 md:hidden">{searchForm}</div>
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            <NavLink href="/" active={pathname === "/"} onClick={closeMenu}>
              Home
            </NavLink>
            <NavLink href="/products" active={pathname.startsWith("/products")} onClick={closeMenu}>
              Shop
            </NavLink>
            {roleLink && (
              <NavLink href={roleLink.href} active={pathname.startsWith(roleLink.href)} onClick={closeMenu}>
                <roleLink.icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                {roleLink.label}
              </NavLink>
            )}
            {ready && session ? (
              <>
                <NavLink
                  href={LANDING_PAGE[session.role] ?? "/account"}
                  active={pathname === (LANDING_PAGE[session.role] ?? "/account")}
                  onClick={closeMenu}
                >
                  <UserCircle2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  {session.username}
                  <Badge variant={ROLE_VARIANT[session.role] ?? "neutral"} className="ml-1">
                    {session.role}
                  </Badge>
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-danger hover:bg-danger-soft"
                >
                  <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Log out
                </button>
              </>
            ) : ready ? (
              <div className="mt-2 flex gap-2">
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
          </nav>
        </div>
      )}
    </header>
  );
}
