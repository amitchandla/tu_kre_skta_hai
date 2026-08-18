"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function validatePassword(password: string, confirm: string) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must include a lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must include a number.";
  if (password !== confirm) return "Passwords do not match.";
  return null;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const validationError = validatePassword(password, confirm);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    // Supabase reads the recovery token from the URL fragment automatically
    // once the user lands here from the email link.
    const { error } = await supabase.auth.updateUser({ password });

    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm card p-8">
        <span className="font-display text-xl font-semibold">BizGrow AI</span>
        <h1 className="mt-4 text-2xl font-semibold">Set a new password</h1>

        {done ? (
          <p className="mt-4 rounded-lg bg-accent-400/10 px-4 py-3 text-sm text-accent-500">
            Password updated. Redirecting to login...
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            {error && <p role="alert" className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}
            <div>
              <label className="label" htmlFor="password">New Password</label>
              <input id="password" type="password" required className="input" value={password}
                onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <div>
              <label className="label" htmlFor="confirm">Confirm Password</label>
              <input id="confirm" type="password" required className="input" value={confirm}
                onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
