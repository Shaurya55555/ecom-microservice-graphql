"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { REGISTER } from "@/lib/graphql/mutations";

type RegisterResult = {
  register: {
    message: string;
    userId: string;
  };
};

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [register, { loading, error }] = useMutation<RegisterResult>(REGISTER);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data } = await register({ variables: { username, email, password } });
    if (data?.register) {
      setDone(true);
      setTimeout(() => router.push("/login"), 1200);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-lg font-semibold text-white">Create account</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Calls the gateway&apos;s <code>register</code> mutation → user-service, bcrypt-hashed
        password, stored in MongoDB. Registration doesn&apos;t log you in automatically —
        log in afterwards to get a token.
      </p>

      {done ? (
        <p className="mt-6 text-sm text-emerald-400">Account created — redirecting to login…</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs text-neutral-400">Username</label>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-400/50 focus:outline-none"
            />
          </div>
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
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
      )}

      <p className="mt-4 text-xs text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-300 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
