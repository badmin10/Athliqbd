"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Wordmark from "@/components/Wordmark";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Incorrect email or password.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex">
            <Wordmark light />
          </div>
          <p className="mt-2 font-meta text-xs text-line-grey">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border border-white/10 bg-ink p-6">
          <div>
            <label htmlFor="email" className="font-meta text-xs text-line-grey">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-white/20 bg-transparent px-3 py-2.5 font-body text-sm text-court-white focus:border-track-orange"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="font-meta text-xs text-line-grey">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-white/20 bg-transparent px-3 py-2.5 font-body text-sm text-court-white focus:border-track-orange"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="font-body text-sm text-track-orange">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-track-orange px-6 py-3 font-meta text-xs text-court-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
