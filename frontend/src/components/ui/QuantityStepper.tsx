import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_QTY } from "@/lib/redux/cartSlice";

export function QuantityStepper({
  value,
  onChange,
  label = "quantity",
  size = "md",
  min = 1,
}: {
  value: number;
  onChange: (next: number) => void;
  /** Used in the accessible names, e.g. "Decrease Wireless Mouse quantity". */
  label?: string;
  size?: "sm" | "md";
  /** Setting min=0 lets the "-" button remove the line item. */
  min?: number;
}) {
  const btn = cn(
    "flex items-center justify-center text-muted transition-colors hover:text-fg disabled:opacity-40 disabled:hover:text-muted",
    size === "sm" ? "h-8 w-8" : "h-10 w-10"
  );
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-lg border border-line-strong bg-surface"
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        className={btn}
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
      </button>
      <span
        aria-live="polite"
        className={cn(
          "text-center text-sm font-medium tabular-nums text-fg",
          size === "sm" ? "w-7" : "w-10"
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QTY}
        aria-label={`Increase ${label}`}
        className={btn}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}
