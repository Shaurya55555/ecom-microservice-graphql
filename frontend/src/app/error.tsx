"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
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
      <h1 className="text-3xl font-medium tracking-tight text-fg">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted">
        This page hit a problem while loading. Your cart and wishlist are safe, so give it another try.
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-subtle">Ref: {error.digest}</p>}
      <Button className="mt-8" onClick={() => retry()}>
        <RefreshCw className="h-4 w-4" strokeWidth={2} aria-hidden />
        Try again
      </Button>
    </div>
  );
}
