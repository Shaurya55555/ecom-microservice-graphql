import { Card } from "@/components/ui/Card";
import { formatPrice, pluralize } from "@/lib/utils";
import type { CartItem } from "@/lib/redux/cartSlice";
import { ProductImage } from "@/components/product/ProductImage";

export function OrderSummary({
  items,
  children,
  showItems = false,
}: {
  items: CartItem[];
  children?: React.ReactNode;
  showItems?: boolean;
}) {
  const units = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <Card className="p-5 lg:sticky lg:top-24 lg:self-start">
      <h2 className="text-base font-semibold text-fg">Order summary</h2>

      {showItems && (
        <ul className="mt-4 space-y-3 border-b border-line pb-4">
          {items.map((i) => (
            <li key={i.productId} className="flex items-center gap-3">
              <ProductImage
                src={i.imageUrl}
                alt=""
                category={i.category}
                seed={i.productId}
                className="h-12 w-12 shrink-0 rounded-lg border border-line"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-fg">{i.name}</p>
                <p className="text-xs text-subtle">Qty {i.quantity}</p>
              </div>
              <span className="text-sm tabular-nums text-fg">{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal ({pluralize(units, "item")})</dt>
          <dd className="tabular-nums text-fg">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd className="font-medium text-success">Free</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
          <dt className="text-fg">Total</dt>
          <dd className="tabular-nums text-fg">{formatPrice(subtotal)}</dd>
        </div>
      </dl>
      {children && <div className="mt-5">{children}</div>}
    </Card>
  );
}
