import Link from "next/link";
import { ArrowRight, BadgeCheck, Store, Truck, Zap } from "lucide-react";
import { buttonStyles } from "@/components/ui/Button";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { NewArrivals } from "@/components/home/NewArrivals";

const PERKS = [
  { icon: Zap, title: "Live order updates", text: "Sellers respond in real time — your order page updates the moment they do." },
  { icon: Store, title: "Independent sellers", text: "Every product is listed and fulfilled by the seller who owns it." },
  { icon: BadgeCheck, title: "Verified accounts", text: "Role-based access and JWT-secured checkout keep every account safe." },
  { icon: Truck, title: "Free shipping", text: "No delivery fees on any order, whatever the size." },
];

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-20">
      <section className="relative isolate overflow-hidden rounded-3xl border border-line bg-surface px-6 py-14 shadow-[var(--shadow-card)] sm:px-12 sm:py-20">
        <div
          aria-hidden
          className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 left-1/3 -z-10 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-500/20 to-transparent blur-3xl"
        />
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-medium text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
          Marketplace live
        </p>
        <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight text-fg sm:text-6xl">
          Everything you need,{" "}
          <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
            from sellers you can trust.
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Browse independent sellers, place an order in seconds and watch it move from request to
          accepted — all backed by a microservice architecture.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/products" className={buttonStyles({ size: "lg" })}>
            Shop now
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </Link>
          <Link href="/signup" className={buttonStyles({ size: "lg", variant: "secondary" })}>
            Start selling
          </Link>
        </div>
      </section>

      <section aria-labelledby="categories-heading">
        <div className="mb-6 flex items-end justify-between">
          <h2 id="categories-heading" className="text-xl font-semibold tracking-tight text-fg">
            Shop by category
          </h2>
          <Link href="/products" className="text-sm font-medium text-brand-text hover:underline">
            View all
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {CATEGORIES.filter((c) => c.name !== "General").map((c) => (
            <li key={c.name}>
              <Link
                href={`/products?category=${encodeURIComponent(c.name)}`}
                className="group relative flex h-28 flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[var(--shadow-lift)]"
              >
                <div aria-hidden className={cn("absolute inset-0 bg-gradient-to-br opacity-80", c.gradient)} />
                <c.icon className="relative h-6 w-6 text-fg/70" strokeWidth={1.5} aria-hidden />
                <span className="relative text-sm font-medium text-fg">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <NewArrivals />

      <section aria-label="Why shop with us">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((p) => (
            <li key={p.title} className="rounded-2xl border border-line bg-surface p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-text">
                <p.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-fg">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
