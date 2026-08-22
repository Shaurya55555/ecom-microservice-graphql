import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
        <Icon className="h-5 w-5 text-neutral-500" strokeWidth={1.75} />
      </div>
      <p className="text-sm font-medium text-neutral-300">{title}</p>
      {description && <p className="max-w-xs text-xs text-neutral-500">{description}</p>}
    </div>
  );
}
