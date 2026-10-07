import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface-2/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="font-serif text-xl font-medium tracking-tight text-fg">
            Ecom<span className="text-brand">.</span>store
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            A small marketplace. Sellers list what they have, buyers order straight from them, and
            sellers say yes or no to each order.
          </p>
        </div>

        <nav aria-label="Shop by category">
          <h2 className="text-sm font-medium text-fg">Shop</h2>
          <ul className="mt-3 space-y-2 text-sm">
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
          <h2 className="text-sm font-medium text-fg">Your account</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              ["/account", "Orders"],
              ["/wishlist", "Wishlist"],
              ["/cart", "Cart"],
              ["/signup", "Sell with us"],
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
          © {new Date().getFullYear()} Ecom.store — a demo store. No real payments are taken.
        </p>
      </div>
    </footer>
  );
}
