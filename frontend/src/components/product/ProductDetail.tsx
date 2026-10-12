"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { ChevronRight, PackageSearch } from "lucide-react";
import { GET_PRODUCT, GET_PRODUCTS } from "@/lib/graphql/queries";
import type { Product } from "@/lib/types";
import { useSession } from "@/lib/useSession";
import { useAppDispatch } from "@/lib/redux/hooks";
import { addItem } from "@/lib/redux/cartSlice";
import { useRecentlyViewed } from "@/lib/recent";
import { useIsTouch } from "@/lib/device";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonStyles } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProductImage } from "./ProductImage";
import { WishlistButton } from "./WishlistButton";
import { DoubleTapToSave } from "./DoubleTapToSave";
import { RecentlyViewed } from "./RecentlyViewed";
import { AddToCartButton, BuyerOnlyNote } from "./AddToCartButton";
import { ProductGrid } from "./ProductGrid";

export function ProductDetail({ id, initial }: { id: string; initial: Product | null }) {
  // If the server already resolved the product, don't hit the network again.
  const { data, loading, error, refetch } = useQuery<{ getProduct: Product | null }>(GET_PRODUCT, {
    variables: { id },
    skip: !!initial,
  });
  const product = initial ?? data?.getProduct ?? null;

  if (!product && loading) return <DetailSkeleton />;
  if (error) return <ErrorState error={error} title="Couldn't load this product" onRetry={() => refetch()} />;
  if (!product) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="We couldn't find that product"
        description="The seller may have taken it down."
        action={
          <Link href="/products" className={buttonStyles({ variant: "secondary" })}>
            Back to the shop
          </Link>
        }
      />
    );
  }
  return <DetailView product={product} />;
}

function DetailView({ product }: { product: Product }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { session, ready } = useSession();
  const { record } = useRecentlyViewed();
  const touch = useIsTouch();
  const [quantity, setQuantity] = useState(1);
  const [ctaVisible, setCtaVisible] = useState(true);
  const ctaRef = useRef<HTMLDivElement>(null);
  const canBuy = !session || session.role === "user";
  const category = product.category || "General";

  // Remember this product for the "recently viewed" rows.
  useEffect(() => record(product.id), [record, product.id]);

  // Show the sticky bottom bar only once the real button has scrolled out of view.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [ready, canBuy]);

  function buyNow() {
    dispatch(
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        quantity,
      })
    );
    router.push("/checkout");
  }

  const showBar = ready && canBuy && !ctaVisible;

  return (
    <div className={showBar ? "animate-fade-in pb-24 md:pb-0" : "animate-fade-in"}>
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-subtle">
        <Link href="/" className="hover:text-fg">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link href="/products" className="hover:text-fg">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link href={`/products?category=${encodeURIComponent(category)}`} className="hover:text-fg">
          {category}
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="max-w-[40ch] truncate text-muted" aria-current="page">
          {product.name}
        </span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div>
          <DoubleTapToSave productId={product.id} name={product.name}>
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              category={product.category}
              priority
              className="aspect-square w-full rounded-xl border border-line"
            />
          </DoubleTapToSave>
          {canBuy && (
            <p className="mt-2 text-xs text-subtle">
              {touch ? "Double-tap the photo to save it." : "Double-click the photo to save it."}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-3 text-sm">
            <Link href={`/products?category=${encodeURIComponent(category)}`}>
              <Badge variant="indigo">{category}</Badge>
            </Link>
            {product.createdAt && <span className="text-xs text-subtle">Listed {formatDate(product.createdAt)}</span>}
          </div>

          <h1 className="mt-4 text-4xl font-medium leading-tight tracking-tight text-fg sm:text-5xl">{product.name}</h1>
          <p className="mt-4 text-3xl font-semibold tabular-nums text-fg">{formatPrice(product.price)}</p>
          <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-muted">{product.description}</p>

          <div ref={ctaRef} className="mt-8 border-t border-line pt-8">
            {!ready ? (
              <Skeleton className="h-12 w-full" />
            ) : canBuy ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <QuantityStepper
                    value={quantity}
                    onChange={(n) => setQuantity(Math.max(1, n))}
                    label={`${product.name} quantity`}
                  />
                  <div className="min-w-40 flex-1">
                    <AddToCartButton product={product} quantity={quantity} size="lg" fullWidth />
                  </div>
                  <WishlistButton productId={product.id} name={product.name} className="h-12 w-12" />
                </div>
                <Button variant="secondary" size="lg" className="w-full" onClick={buyNow}>
                  Buy now
                </Button>
              </div>
            ) : (
              <BuyerOnlyNote role={session!.role} />
            )}
          </div>

          <ul className="mt-8 space-y-2 text-sm text-muted">
            <li>Free shipping on every order.</li>
            <li>The seller confirms each order before it goes ahead.</li>
            <li>No payment is taken on this demo store.</li>
          </ul>
        </div>
      </div>

      <div className="mt-16 space-y-16">
        <Related product={product} />
        <RecentlyViewed excludeId={product.id} />
      </div>

      {showBar && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line-strong bg-surface px-4 py-3 md:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-fg">{product.name}</p>
            <p className="text-sm tabular-nums text-muted">{formatPrice(product.price * quantity)}</p>
          </div>
          <AddToCartButton product={product} quantity={quantity} size="md" label="Add to cart" />
        </div>
      )}
    </div>
  );
}

function Related({ product }: { product: Product }) {
  const { data } = useQuery<{ getProducts: Product[] }>(GET_PRODUCTS);
  const related = useMemo(() => {
    const all = (data?.getProducts ?? []).filter((p) => p.id !== product.id);
    const sameCategory = all.filter((p) => (p.category || "General") === (product.category || "General"));
    // Pad with other products so the section is never empty for small catalogs.
    const rest = all.filter((p) => !sameCategory.includes(p));
    return [...sameCategory, ...rest].slice(0, 4);
  }, [data, product]);

  if (related.length === 0) return null;
  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading" className="mb-5 font-serif text-2xl font-medium text-fg">
        You might also like
      </h2>
      <ProductGrid products={related} />
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-14" role="status" aria-label="Loading product">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="mt-8 h-12 w-full" />
      </div>
    </div>
  );
}
