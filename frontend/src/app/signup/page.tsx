"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { UserPlus, ShoppingBag, Store, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { REGISTER } from "@/lib/graphql/mutations";
import { PasswordInput } from "@/components/PasswordInput";
import { Card } from "@/components/ui/Card";
import type { Role } from "@/lib/auth";

type RegisterResult = {
  register: {
    message: string;
    userId: string;
  };
};

const ROLES: { value: Role; label: string; blurb: string; icon: typeof ShoppingBag }[] = [
  { value: "user", label: "Buyer", blurb: "Search products, add to cart, request an order", icon: ShoppingBag },
  { value: "seller", label: "Seller", blurb: "List products, view and accept order requests", icon: Store },
];

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [register, { loading, error }] = useMutation<RegisterResult>(REGISTER);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data } = await register({ variables: { username, email, password, role } });
    if (data?.register) {
      setDone(true);
      setTimeout(() => router.push("/login"), 1200);
    }
  }

  return (
    <div className="mx-auto max-w-sm animate-fade-in">
      <div className="mb-6 flex justify-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
          <UserPlus className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
      </div>
      <h1 className="text-center text-lg font-semibold text-white">Create account</h1>
      <p className="mt-1.5 text-center text-sm text-neutral-400">
        Calls the gateway&apos;s <code className="text-neutral-300">register</code> mutation → user-service, bcrypt-hashed
        password. Log in afterwards to get a token.
      </p>

      {done ? (
        <Card className="mt-6 flex items-center gap-2.5 p-6 text-sm text-emerald-400">
          <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
          Account created — redirecting to login…
        </Card>
      ) : (
        <Card className="mt-6 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-400">Username</label>
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white transition-colors focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-400">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white transition-colors focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-neutral-400">
                Password
              </label>
              <PasswordInput
                id="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={setPassword}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-400">Account type</label>
              <div className="space-y-2">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  return (
                    <label
                      key={r.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                        role === r.value
                          ? "border-indigo-400/50 bg-indigo-500/10"
                          : "border-white/10 bg-neutral-950 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={role === r.value}
                        onChange={() => setRole(r.value)}
                        className="sr-only"
                      />
                      <Icon
                        className={`mt-0.5 h-4 w-4 shrink-0 ${role === r.value ? "text-indigo-300" : "text-neutral-500"}`}
                        strokeWidth={2}
                      />
                      <span>
                        <span className="block text-white">{r.label}</span>
                        <span className="block text-xs text-neutral-500">{r.blurb}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
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
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>
        </Card>
      )}

      <p className="mt-5 text-center text-xs text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-300 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
