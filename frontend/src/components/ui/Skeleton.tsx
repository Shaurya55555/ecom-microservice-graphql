export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-white/5 ${className}`} />;
}

export function CardRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-14" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-neutral-900/50 p-5">
      <Skeleton className="h-9 w-9 rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="mt-2 h-5 w-16" />
    </div>
  );
}
