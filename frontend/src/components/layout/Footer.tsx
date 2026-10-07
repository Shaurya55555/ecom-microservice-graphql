import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-fg">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <ShoppingBag className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
            </span>
            <span>
              Ecom<span className="text-brand-text">.</span>store
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            A full-stack marketplace built on Node.js microservices, Kafka and a GraphQL gateway,
            with a Next.js frontend. Buyers shop, sellers fulfil, admins keep it safe.
          </p>
        </div>

        <nav aria-label="Shop by category">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-subtle">Shop</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {CATEGORIES.slice(0, 5).map((c) => (
              <li key={c.name}>
                <Link
                  href={`/products?category=${encodeURIComponent(c.name)}`}
                  className="text-muted transition-colors hover:text-fg"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-subtle">Account</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              ["/account", "My orders"],
              ["/wishlist", "Wishlist"],
              ["/cart", "Cart"],
              ["/signup", "Become a seller"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-muted transition-colors hover:text-fg">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-subtle sm:px-6">
          © {new Date().getFullYear()} Ecom.store — a demo storefront. No real payments are taken.
        </p>
      </div>
    </footer>
  );
}
