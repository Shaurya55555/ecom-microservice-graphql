"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { LOGIN } from "@/lib/graphql/mutations";
import { saveSession } from "@/lib/auth";

type LoginResult = {
  login: {
    token: string;
    userId: string;
    username: string;
    email: string;
  };
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
      router.push("/account");
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-lg font-semibold text-white">Log in</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Real auth — this calls the gateway&apos;s <code>login</code> mutation, which proxies
        to user-service and returns a signed JWT.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs text-neutral-400">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-400/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-neutral-400">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-400/50 focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error.message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-indigo-500 py-2.5 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Log in"}
        </button>
      </form>

      <p className="mt-4 text-xs text-neutral-500">
        No account?{" "}
        <Link href="/signup" className="text-indigo-300 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
