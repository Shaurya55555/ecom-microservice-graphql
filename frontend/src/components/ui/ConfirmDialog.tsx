"use client";

import { useEffect, useRef } from "react";
import { Button } from "./Button";

/**
 * Confirmation modal built on the native <dialog> element, which gives focus
 * trapping, Escape-to-close and a backdrop without any extra dependency.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onCancel();
      }}
      aria-labelledby="confirm-title"
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl border border-line bg-surface p-6 text-fg shadow-[var(--shadow-lift)]"
    >
      <h2 id="confirm-title" className="text-base font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          className="bg-danger hover:bg-danger hover:opacity-90"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
