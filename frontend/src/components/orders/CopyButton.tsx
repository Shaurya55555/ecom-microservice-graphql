"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

/** Copies a value (e.g. an order reference) to the clipboard, with a visible confirmation. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — select it manually instead.");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-surface-2 hover:text-fg"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" strokeWidth={2.5} aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
