"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const justConfirmed = params.get("confirm") === "1";
  const redirectTo = params.get("redirect") || "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setSubmitting(false);

    if (error) {
      if (error.message.toLowerCase().includes("invalid login")) {
        setError("Incorrect email or password. Please try again.");
      } else if (error.message.toLowerCase().includes("email not confirmed")) {
        setError("Please confirm your email before logging in — check your inbox.");
      } else {
        setError(error.message);
      }
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <form onSubmit={handleSubmit} noValidate className="w-full max-w-sm card p-8">
        <span className="font-display text-xl font-semibold">BizGrow AI</span>
        <h1 className="mt-4 text-2xl font-semibold">Welcome back</h1>

        {justConfirmed && (
          <p className="mt-4 rounded-lg bg-accent-400/10 px-4 py-3 text-sm text-accent-500">
            Your email is confirmed — please log in.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="input" value={email}
              onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label" htmlFor="password">Password</label>
              <Link href="/forgot-password" className="text-xs font-semibold text-brand-500">Forgot password?</Link>
            </div>
            <input id="password" type="password" required className="input" value={password}
              onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-ink/60">
          Don't have an account? <Link href="/signup" className="font-semibold text-brand-500">Create one</Link>
        </p>
      </form>
    </main>
  );
}
