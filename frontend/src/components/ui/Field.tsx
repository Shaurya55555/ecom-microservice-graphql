import { useId } from "react";
import { cn } from "@/lib/utils";

const CONTROL =
  "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-fg placeholder:text-subtle " +
  "transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export function controlClass(hasError?: boolean, extra?: string) {
  return cn(
    CONTROL,
    hasError ? "border-danger/60 focus:border-danger" : "border-line-strong focus:border-brand",
    extra
  );
}

type FieldShellProps = {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
};

/** Label + control + error/hint wiring (aria-invalid, aria-describedby) in one place. */
export function Field({ label, error, hint, className, children }: FieldShellProps) {
  const id = useId();
  const messageId = `${id}-msg`;
  const describedBy = error || hint ? messageId : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted">
        {label}
      </label>
      {children({ id, describedBy, invalid: !!error })}
      {(error || hint) && (
        <p
          id={messageId}
          role={error ? "alert" : undefined}
          className={cn("mt-1.5 text-xs", error ? "text-danger" : "text-subtle")}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  fieldClassName?: string;
  ref?: React.Ref<HTMLInputElement>;
};

export function Input({ label, error, hint, icon, fieldClassName, className, ref, ...props }: InputProps) {
  return (
    <Field label={label} error={error} hint={hint} className={fieldClassName}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle">
              {icon}
            </span>
          )}
          <input
            id={id}
            ref={ref}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={controlClass(invalid, cn(icon && "pl-9", className))}
            {...props}
          />
        </div>
      )}
    </Field>
  );
}

type TextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  label: string;
  error?: string;
  hint?: string;
  fieldClassName?: string;
  ref?: React.Ref<HTMLTextAreaElement>;
};

export function Textarea({ label, error, hint, fieldClassName, className, ref, ...props }: TextareaProps) {
  return (
    <Field label={label} error={error} hint={hint} className={fieldClassName}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          ref={ref}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={controlClass(invalid, cn("min-h-24 resize-y", className))}
          {...props}
        />
      )}
    </Field>
  );
}

type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  label: string;
  error?: string;
  hint?: string;
  fieldClassName?: string;
  ref?: React.Ref<HTMLSelectElement>;
};

export function Select({ label, error, hint, fieldClassName, className, ref, children, ...props }: SelectProps) {
  return (
    <Field label={label} error={error} hint={hint} className={fieldClassName}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          ref={ref}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={controlClass(invalid, className)}
          {...props}
        >
          {children}
        </select>
      )}
    </Field>
  );
}
