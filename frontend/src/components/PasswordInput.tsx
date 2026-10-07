"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Field, controlClass } from "@/components/ui/Field";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "type"> & {
  label: string;
  error?: string;
  hint?: string;
  ref?: React.Ref<HTMLInputElement>;
};

/** Password field with a show/hide toggle. Works with react-hook-form's register(). */
export function PasswordInput({ label, error, hint, ref, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} error={error} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
            strokeWidth={2}
            aria-hidden
          />
          <input
            id={id}
            ref={ref}
            type={visible ? "text" : "password"}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={controlClass(invalid, "pl-9 pr-10")}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-subtle hover:text-fg"
          >
            {visible ? (
              <EyeOff className="h-4 w-4" strokeWidth={2} aria-hidden />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
            )}
          </button>
        </div>
      )}
    </Field>
  );
}
