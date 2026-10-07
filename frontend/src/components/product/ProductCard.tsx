"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ProductImage } from "./ProductImage";
import { WishlistButton } from "./WishlistButton";
import { AddToCartButton } from "./AddToCartButton";
import { useSession } from "@/lib/useSession";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

const NEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function isNew(createdAt?: string | null) {
  if (!createdAt) return false;
  const t = new Date(createdAt).getTime();
  return !Number.isNaN(t) && Date.now() - t < NEW_WINDOW_MS;
}

export function ProductCard({ product }: { product: Product }) {
  const { session } = useSession();
  const canBuy = !session || session.role === "user";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[var(--shadow-lift)]">
      <div className="relative">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          category={product.category}
          seed={product.id}
          className="aspect-square w-full"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {isNew(product.createdAt) && <Badge variant="indigo">New</Badge>}
        </div>
        <WishlistButton
          productId={product.id}
          name={product.name}
          className="absolute right-3 top-3 z-10"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <p className="text-[11px] font-medium uppercase tracking-wider text-subtle">
            {product.category}
          </p>
        )}
        <h3 className="mt-1 text-sm font-medium text-fg">
          {/* Stretched link: the whole card is clickable, while the buttons above stay independently focusable. */}
          <Link
            href={`/products/${product.id}`}
            className="after:absolute after:inset-0 after:content-[''] hover:text-brand-text"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{product.description}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="text-base font-semibold tabular-nums text-fg">
            {formatPrice(product.price)}
          </span>
          {canBuy && (
            <div className="relative z-10">
              <AddToCartButton product={product} size="sm" label="Add" />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
