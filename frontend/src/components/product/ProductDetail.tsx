"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { ChevronRight, PackageSearch, RotateCcw, ShieldCheck, Truck, Zap } from "lucide-react";
import { GET_PRODUCT, GET_PRODUCTS } from "@/lib/graphql/queries";
import type { Product } from "@/lib/types";
import { useSession } from "@/lib/useSession";
import { useAppDispatch } from "@/lib/redux/hooks";
import { addItem } from "@/lib/redux/cartSlice";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonStyles } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProductImage } from "./ProductImage";
import { WishlistButton } from "./WishlistButton";
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
        title="Product not found"
        description="It may have been removed by the seller."
        action={
          <Link href="/products" className={buttonStyles({ variant: "secondary" })}>
            Back to shop
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
  const [quantity, setQuantity] = useState(1);
  const canBuy = !session || session.role === "user";
  const category = product.category || "General";

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

  return (
    <div className="animate-fade-in">
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
        <div className="relative">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            category={product.category}
            seed={product.id}
            priority
            className="aspect-square w-full rounded-3xl border border-line"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Link href={`/products?category=${encodeURIComponent(category)}`}>
              <Badge variant="indigo">{category}</Badge>
            </Link>
            {product.createdAt && (
              <span className="text-xs text-subtle">Listed {formatDate(product.createdAt)}</span>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-3xl font-semibold tabular-nums text-fg">{formatPrice(product.price)}</p>
          <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-muted">{product.description}</p>

          <div className="mt-8 border-t border-line pt-8">
            {!ready ? (
              <Skeleton className="h-12 w-full" />
            ) : canBuy ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <QuantityStepper value={quantity} onChange={(n) => setQuantity(Math.max(1, n))} label={`${product.name} quantity`} />
                  <div className="min-w-40 flex-1">
                    <AddToCartButton product={product} quantity={quantity} size="lg" fullWidth />
                  </div>
                  <WishlistButton productId={product.id} name={product.name} className="h-12 w-12" />
                </div>
                <Button variant="secondary" size="lg" className="w-full" onClick={buyNow}>
                  <Zap className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Buy now
                </Button>
              </div>
            ) : (
              <BuyerOnlyNote role={session!.role} />
            )}
          </div>

          <ul className="mt-8 grid gap-3 text-sm text-muted sm:grid-cols-3">
            {[
              [Truck, "Free shipping"],
              [ShieldCheck, "Secure checkout"],
              [RotateCcw, "Seller-fulfilled"],
            ].map(([Icon, text]) => {
              const I = Icon as typeof Truck;
              return (
                <li key={text as string} className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5">
                  <I className="h-4 w-4 text-brand-text" strokeWidth={1.75} aria-hidden />
                  {text as string}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <Related product={product} />
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
    <section aria-labelledby="related-heading" className="mt-20">
      <h2 id="related-heading" className="mb-6 text-xl font-semibold tracking-tight text-fg">
        You might also like
      </h2>
      <ProductGrid products={related} />
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-14" role="status" aria-label="Loading product">
      <Skeleton className="aspect-square w-full rounded-3xl" />
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
