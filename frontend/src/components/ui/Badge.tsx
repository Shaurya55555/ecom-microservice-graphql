const VARIANTS = {
  amber: "bg-amber-500/10 text-amber-400 ring-amber-500/25",
  emerald: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/25",
  red: "bg-red-500/10 text-red-400 ring-red-500/25",
  indigo: "bg-indigo-500/10 text-indigo-300 ring-indigo-500/25",
  neutral: "bg-white/5 text-neutral-400 ring-white/10",
} as const;

export function Badge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}

export const STATUS_VARIANT: Record<string, keyof typeof VARIANTS> = {
  Pending: "amber",
  Accepted: "emerald",
  Rejected: "red",
};

export const ROLE_VARIANT: Record<string, keyof typeof VARIANTS> = {
  user: "indigo",
  seller: "emerald",
  admin: "amber",
};
