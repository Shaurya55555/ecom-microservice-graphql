import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonStyles } from "@/components/ui/Button";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { NewArrivals } from "@/components/home/NewArrivals";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";

const STEPS = [
  ["Pick something", "Browse what sellers have listed, or search for it."],
  ["Place an order", "Add it to your cart and check out. No payment is taken here."],
  ["The seller answers", "They accept or decline. You can watch it change on your order page."],
];

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-20">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-16">
        <div>
          <p className="text-sm text-muted">Independent sellers · direct orders</p>
          <h1 className="mt-3 text-4xl font-medium leading-[1.08] tracking-tight text-fg sm:text-6xl">
            Good things, from the people who sell them.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            Everything here is listed by an individual seller, and every order goes to them first.
            Find something you like and see what they say.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/products" className={buttonStyles({ size: "lg" })}>
              Shop everything
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </Link>
            <Link href="/signup" className="text-sm font-medium text-fg underline underline-offset-4 hover:text-brand-text">
              Sell something of your own
            </Link>
          </div>
        </div>

        <aside aria-labelledby="how-heading" className="rounded-xl border border-line bg-surface p-6 sm:p-8">
          <h2 id="how-heading" className="font-serif text-xl font-medium text-fg">
            How an order works
          </h2>
          <ol className="mt-5 space-y-5">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="flex gap-4">
                <span className="font-serif text-2xl leading-none text-brand" aria-hidden>
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-fg">{title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section aria-labelledby="categories-heading">
        <div className="mb-5 flex items-end justify-between">
          <h2 id="categories-heading" className="font-serif text-2xl font-medium text-fg">
            Shop by category
          </h2>
          <Link href="/products" className="text-sm font-medium text-brand-text hover:underline">
            See everything
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.filter((c) => c.name !== "General").map((c) => (
            <li key={c.name}>
              <Link
                href={`/products?category=${encodeURIComponent(c.name)}`}
                className={cn(
                  "group flex h-28 flex-col justify-between rounded-xl border border-line p-4 transition-colors hover:border-line-strong",
                  c.tone
                )}
              >
                <c.icon className="h-6 w-6 text-fg/60" strokeWidth={1.25} aria-hidden />
                <span className="flex items-center justify-between text-sm font-medium text-fg">
                  {c.name}
                  <ArrowRight
                    className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/products"
              className="group flex h-28 flex-col justify-between rounded-xl border border-line-strong bg-surface p-4 transition-colors hover:bg-surface-2"
            >
              <ArrowRight className="h-6 w-6 text-fg/60" strokeWidth={1.25} aria-hidden />
              <span className="text-sm font-medium text-fg">All products</span>
            </Link>
          </li>
        </ul>
      </section>

      <RecentlyViewed title="Pick up where you left off" />
      <NewArrivals />
    </div>
  );
}
