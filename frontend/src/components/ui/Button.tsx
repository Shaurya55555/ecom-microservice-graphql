import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-brand-fg hover:bg-brand-hover",
  secondary: "border border-line-strong bg-surface text-fg hover:bg-surface-2",
  ghost: "text-muted hover:bg-surface-2 hover:text-fg",
  danger:
    "border border-line-strong bg-surface text-fg hover:border-danger/60 hover:bg-danger-soft hover:text-danger",
  success: "bg-success text-brand-fg hover:opacity-90",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2 px-6 text-base",
};

/** Class string shared by <Button> and anything that needs to look like one (e.g. <Link>). */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-md font-medium transition-colors active:translate-y-px",
    "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0",
    VARIANTS[variant],
    SIZES[size],
    className
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function Button({
  variant,
  size,
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden />}
      {children}
    </button>
  );
}
