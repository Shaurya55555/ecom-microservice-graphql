import { cn } from "@/lib/utils";

const VARIANTS = {
  amber: "bg-warning-soft text-warning",
  emerald: "bg-success-soft text-success",
  red: "bg-danger-soft text-danger",
  indigo: "bg-brand-soft text-brand-text",
  neutral: "bg-surface-2 text-muted",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

/** A quiet label rather than a glowing pill. */
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
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium",
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
