"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center" role="alert">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <AlertTriangle className="h-8 w-8" strokeWidth={1.5} aria-hidden />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-fg">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted">
        An unexpected error occurred while loading this page. Your cart and wishlist are safe.
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-subtle">Ref: {error.digest}</p>}
      <Button className="mt-8" onClick={() => retry()}>
        <RefreshCw className="h-4 w-4" strokeWidth={2} aria-hidden />
        Try again
      </Button>
    </div>
  );
}
