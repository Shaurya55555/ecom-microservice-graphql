import type { Metadata } from "next";
import { fetchProduct } from "@/lib/graphql/server";
import { ProductDetail } from "@/components/product/ProductDetail";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) return { title: "Product" };

  const description = `${formatPrice(product.price)} — ${product.description}`.slice(0, 200);
  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      ...(product.imageUrl ? { images: [{ url: product.imageUrl }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  // Server-rendered when the gateway is reachable; otherwise the client component fetches it.
  const initial = await fetchProduct(id);
  return <ProductDetail id={id} initial={initial} />;
}
