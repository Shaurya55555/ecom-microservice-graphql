import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">
        <Icon className="h-5 w-5 text-subtle" strokeWidth={1.75} aria-hidden />
      </div>
      <p className="text-sm font-medium text-fg">{title}</p>
      {description && <p className="max-w-xs text-xs text-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
