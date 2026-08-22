"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export function PasswordInput({
  id,
  value,
  onChange,
  required,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" strokeWidth={2} />
      <input
        id={id}
        type={visible ? "text" : "password"}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-neutral-950 py-2 pl-9 pr-10 text-sm text-white transition-colors focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-neutral-500 hover:text-neutral-300"
      >
        {visible ? <EyeOff className="h-4 w-4" strokeWidth={2} /> : <Eye className="h-4 w-4" strokeWidth={2} />}
      </button>
    </div>
  );
}
