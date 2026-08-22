"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { KeyRound, Mail, AlertCircle, Loader2 } from "lucide-react";
import { LOGIN } from "@/lib/graphql/mutations";
import { saveSession, type Role } from "@/lib/auth";
import { PasswordInput } from "@/components/PasswordInput";
import { Card } from "@/components/ui/Card";

type LoginResult = {
  login: {
    token: string;
    userId: string;
    username: string;
    email: string;
    role: Role;
  };
};

const LANDING_PAGE: Record<Role, string> = {
  user: "/account",
  seller: "/sell",
  admin: "/admin",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { loading, error }] = useMutation<LoginResult>(LOGIN);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data } = await login({ variables: { email, password } });
    if (data?.login) {
      saveSession(data.login);
      router.push(LANDING_PAGE[data.login.role] ?? "/account");
    }
  }

  return (
    <div className="mx-auto max-w-sm animate-fade-in">
      <div className="mb-6 flex justify-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
          <KeyRound className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
      </div>
      <h1 className="text-center text-lg font-semibold text-white">Welcome back</h1>
      <p className="mt-1.5 text-center text-sm text-neutral-400">
        Real auth — this calls the gateway&apos;s <code className="text-neutral-300">login</code> mutation, which proxies
        to user-service and returns a signed JWT.
      </p>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" strokeWidth={2} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-neutral-950 py-2 pl-9 pr-3 text-sm text-white transition-colors focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-neutral-400">
              Password
            </label>
            <PasswordInput
              id="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs text-red-300">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              {error.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/30 transition-colors hover:bg-indigo-400 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>
      </Card>

      <p className="mt-5 text-center text-xs text-neutral-500">
        No account?{" "}
        <Link href="/signup" className="font-medium text-indigo-300 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
