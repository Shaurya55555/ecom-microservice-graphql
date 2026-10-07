import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("rounded-xl border border-line bg-surface", className)}>{children}</div>;
}

export function CardRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-5 py-4 transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-surface-2/60",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  hint,
  count,
  action,
}: {
  title: string;
  hint?: string;
  count?: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="font-serif text-lg font-medium text-fg">
        {title}
        {count !== undefined && (
          <span className="ml-2 font-sans text-xs font-normal text-subtle">({count})</span>
        )}
      </h2>
      {action ?? (hint && <p className="text-xs text-subtle">{hint}</p>)}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-fg sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
