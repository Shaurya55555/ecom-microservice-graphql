"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, MapPin, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { CREATE_ORDER } from "@/lib/graphql/mutations";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { removeItem, selectCartItems } from "@/lib/redux/cartSlice";
import { shippingSchema, type ShippingValues } from "@/lib/validation/schemas";
import { loadShipping, saveOrderShipping, saveShipping } from "@/lib/shipping";
import { friendlyError } from "@/lib/utils";
import { RequireRole } from "@/components/layout/RequireRole";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { Card, PageHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Button, buttonStyles } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Session } from "@/lib/auth";

type CreateOrderResult = { createOrder: { id: string } };

export default function CheckoutPage() {
  return (
    <RequireRole roles={["user"]} what="checkout">
      {(session) => <Checkout session={session} />}
    </RequireRole>
  );
}

function Checkout({ session }: { session: Session }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const hydrated = useAppSelector((s) => s.cart.hydrated);
  const [createOrder] = useMutation<CreateOrderResult>(CREATE_ORDER);
  const [placing, setPlacing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShippingValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { fullName: session.username, country: "United States" },
  });

  // Pre-fill from the last address used on this device.
  useEffect(() => {
    const saved = loadShipping();
    if (Object.keys(saved).length) reset({ fullName: session.username, country: "United States", ...saved });
  }, [reset, session.username]);

  async function onSubmit(values: ShippingValues) {
    setPlacing(true);
    const placed: string[] = [];
    try {
      // Sequential on purpose: a failure part-way leaves a clean, retryable remainder in the cart.
      for (const item of items) {
        const { data } = await createOrder({
          variables: { productId: item.productId, userId: session.userId, quantity: item.quantity },
        });
        if (data?.createOrder) {
          placed.push(data.createOrder.id);
          dispatch(removeItem({ productId: item.productId }));
        }
      }
      saveShipping(values);
      saveOrderShipping(placed, values);
      toast.success(placed.length === 1 ? "Order placed!" : `${placed.length} orders placed!`);
      router.push(placed.length === 1 ? `/orders/${placed[0]}?placed=1` : "/account?placed=" + placed.length);
    } catch (err) {
      if (placed.length > 0) {
        saveOrderShipping(placed, values);
        toast.error(
          `${placed.length} of ${items.length} orders went through before an error. The rest are still in your cart.`
        );
      } else {
        toast.error(friendlyError(err, "We couldn't place your order."));
      }
      setPlacing(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="space-y-4" aria-busy>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (items.length === 0 && !placing) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Nothing to check out"
        description="Your cart is empty."
        action={
          <Link href="/products" className={buttonStyles({})}>
            Browse products
          </Link>
        }
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Checkout" description="Tell us where to send your order." />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-text" strokeWidth={2} aria-hidden />
              <h2 className="text-base font-semibold text-fg">Shipping address</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
              <Input
                label="Phone"
                type="tel"
                autoComplete="tel"
                error={errors.phone?.message}
                {...register("phone")}
              />
              <Input
                label="Street address"
                autoComplete="street-address"
                fieldClassName="sm:col-span-2"
                error={errors.address?.message}
                {...register("address")}
              />
              <Input label="City" autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
              <Input
                label="State / region"
                autoComplete="address-level1"
                error={errors.state?.message}
                {...register("state")}
              />
              <Input
                label="Postal code"
                autoComplete="postal-code"
                error={errors.postalCode?.message}
                {...register("postalCode")}
              />
              <Input
                label="Country"
                autoComplete="country-name"
                error={errors.country?.message}
                {...register("country")}
              />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-brand-text" strokeWidth={2} aria-hidden />
              <h2 className="text-base font-semibold text-fg">Payment</h2>
            </div>
            <p className="mt-3 text-sm text-muted">
              Pay the seller on delivery. This is a demo store, so no card details are collected and
              no money moves.
            </p>
          </Card>
        </div>

        <OrderSummary items={items} showItems>
          <Button type="submit" size="lg" className="w-full" loading={placing}>
            {placing ? "Placing order…" : "Place order"}
          </Button>
          <p className="mt-3 text-center text-xs text-subtle">
            Each product becomes a request the seller accepts or rejects.
          </p>
        </OrderSummary>
      </form>
    </div>
  );
}
