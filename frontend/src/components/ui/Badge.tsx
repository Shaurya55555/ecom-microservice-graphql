import { cn } from "@/lib/utils";

const VARIANTS = {
  amber: "bg-warning-soft text-warning ring-warning/25",
  emerald: "bg-success-soft text-success ring-success/25",
  red: "bg-danger-soft text-danger ring-danger/25",
  indigo: "bg-brand-soft text-brand-text ring-brand/25",
  neutral: "bg-surface-2 text-muted ring-line",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export const STATUS_VARIANT: Record<string, BadgeVariant> = {
  Pending: "amber",
  Accepted: "emerald",
  Rejected: "red",
};

export const ROLE_VARIANT: Record<string, BadgeVariant> = {
  user: "indigo",
  seller: "emerald",
  admin: "amber",
};
