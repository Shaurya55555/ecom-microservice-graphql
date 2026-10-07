"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Mail, Store, User, UserRound } from "lucide-react";
import { toast } from "sonner";
import { LOGIN, REGISTER } from "@/lib/graphql/mutations";
import { LANDING_PAGE, saveSession, type Role } from "@/lib/auth";
import { signupSchema, type SignupValues } from "@/lib/validation/schemas";
import { safeRedirect } from "@/lib/safeRedirect";
import { cn, friendlyError } from "@/lib/utils";
import { PasswordInput } from "@/components/PasswordInput";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "./AuthShell";

type LoginResult = {
  login: { token: string; userId: string; username: string; email: string; role: Role };
};

const ROLES = [
  { value: "user", label: "Buyer", hint: "Shop and place orders", icon: UserRound },
  { value: "seller", label: "Seller", hint: "List products, fulfil orders", icon: Store },
] as const;

export function SignupForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [registerUser] = useMutation(REGISTER);
  const [login] = useMutation<LoginResult>(LOGIN);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "user" },
  });
  const role = useWatch({ control, name: "role" });

  async function onSubmit(values: SignupValues) {
    setFormError(null);
    try {
      await registerUser({
        variables: {
          username: values.username,
          email: values.email,
          password: values.password,
          role: values.role,
        },
      });
      // Log straight in so there's no second form to fill.
      const { data } = await login({ variables: { email: values.email, password: values.password } });
      if (!data?.login) throw new Error("Account created, but automatic login failed. Please log in.");
      saveSession(data.login);
      toast.success("Account created — welcome aboard!");
      router.push(safeRedirect(next, LANDING_PAGE[data.login.role] ?? "/account"));
    } catch (err) {
      setFormError(friendlyError(err, "We couldn't create your account."));
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join as a buyer to shop, or as a seller to start listing products."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="font-medium text-brand-text hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <fieldset>
          <legend className="mb-1.5 text-xs font-medium text-muted">I want to</legend>
          <div className="grid grid-cols-2 gap-2.5">
            {ROLES.map((r) => (
              <label
                key={r.value}
                className={cn(
                  "flex cursor-pointer flex-col gap-1 rounded-xl border p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--ring)]",
                  role === r.value
                    ? "border-brand bg-brand-soft"
                    : "border-line-strong bg-surface hover:bg-surface-2"
                )}
              >
                <input type="radio" value={r.value} className="sr-only" {...register("role")} />
                <r.icon
                  className={cn("h-4 w-4", role === r.value ? "text-brand-text" : "text-subtle")}
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="text-sm font-medium text-fg">{r.label}</span>
                <span className="text-xs text-muted">{r.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <Input
          label="Username"
          autoComplete="username"
          icon={<User className="h-4 w-4" strokeWidth={2} aria-hidden />}
          error={errors.username?.message}
          {...register("username")}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          icon={<Mail className="h-4 w-4" strokeWidth={2} aria-hidden />}
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordInput
          label="Password"
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2.5 text-xs text-danger"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            {formError}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
