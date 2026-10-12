import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";
import { friendlyError } from "@/lib/utils";

/** Inline error panel for failed queries, with an optional retry. */
export function ErrorState({
  error,
  title = "Couldn't load this",
  onRetry,
}: {
  error?: unknown;
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-xl border border-danger/25 bg-danger-soft px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" strokeWidth={2} aria-hidden />
        <div>
          <p className="text-sm font-medium text-danger">{title}</p>
          <p className="mt-0.5 text-xs text-muted">{friendlyError(error)}</p>
        </div>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Try again
        </Button>
      )}
    </div>
  );
}
