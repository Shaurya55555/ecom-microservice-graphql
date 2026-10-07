"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Mail } from "lucide-react";
import { toast } from "sonner";
import { LOGIN } from "@/lib/graphql/mutations";
import { LANDING_PAGE, saveSession, type Role } from "@/lib/auth";
import { loginSchema, type LoginValues } from "@/lib/validation/schemas";
import { safeRedirect } from "@/lib/safeRedirect";
import { friendlyError } from "@/lib/utils";
import { PasswordInput } from "@/components/PasswordInput";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "./AuthShell";

type LoginResult = {
  login: { token: string; userId: string; username: string; email: string; role: Role };
};

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [login] = useMutation<LoginResult>(LOGIN);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      const { data } = await login({ variables: values });
      if (!data?.login) throw new Error("Login failed");
      saveSession(data.login);
      toast.success(`Welcome back, ${data.login.username}!`);
      router.push(safeRedirect(next, LANDING_PAGE[data.login.role] ?? "/account"));
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      // 401/404 from the user service both mean "these credentials don't work".
      setFormError(
        /status code (401|404)/.test(raw) ? "Incorrect email or password." : friendlyError(err, "Couldn't log you in.")
      );
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to track orders, manage your store or administer the marketplace."
      footer={
        <>
          New here?{" "}
          <Link
            href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
            className="font-medium text-brand-text hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
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
          {isSubmitting ? "Signing in…" : "Log in"}
        </Button>
      </form>
    </AuthShell>
  );
}
