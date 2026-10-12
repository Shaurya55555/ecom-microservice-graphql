import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderDetail } from "@/components/orders/OrderDetail";
import { Skeleton } from "@/components/ui/Skeleton";
import { shortId } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/orders/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order #${shortId(id)}`, robots: { index: false } };
}

export default async function OrderPage({ params }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-2xl" />}>
      <OrderDetail id={id} />
    </Suspense>
  );
}
