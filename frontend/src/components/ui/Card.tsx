export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-neutral-900/50 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardRow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-4 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-white/[0.03] ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  hint,
  count,
}: {
  title: string;
  hint?: string;
  count?: number;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-sm font-semibold tracking-wide text-white">
        {title}
        {count !== undefined && (
          <span className="ml-2 text-xs font-normal text-neutral-500">({count})</span>
        )}
      </h2>
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
