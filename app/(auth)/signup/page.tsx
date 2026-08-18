"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface FormState {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

const initialState: FormState = {
  fullName: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

function validate(form: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  const name = form.fullName.trim();
  if (!name) errors.fullName = "Please enter your full name.";
  else if (name.length < 2) errors.fullName = "Name must be at least 2 characters.";
  else if (/^\d+$/.test(name)) errors.fullName = "Name cannot contain only numbers.";

  const email = form.email.trim().toLowerCase();
  if (!email) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Please enter a valid email address.";

  const mobile = form.mobile.trim();
  if (!mobile) errors.mobile = "Please enter your mobile number.";
  else if (!/^[6-9]\d{9}$/.test(mobile)) errors.mobile = "Enter a valid 10-digit Indian mobile number starting with 6-9.";

  if (form.password.length < 8) errors.password = "Password must be at least 8 characters.";
  else if (!/[A-Z]/.test(form.password)) errors.password = "Password must include an uppercase letter.";
  else if (!/[a-z]/.test(form.password)) errors.password = "Password must include a lowercase letter.";
  else if (!/[0-9]/.test(form.password)) errors.password = "Password must include a number.";

  if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords do not match.";

  if (!form.acceptedTerms) errors.acceptedTerms = "Please accept the Terms to continue.";

  return errors;
}

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setServerError(null);

    const email = form.email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName.trim(),
          mobile: form.mobile.trim(),
        },
      },
    });

    if (error) {
      setSubmitting(false);
      if (error.message.toLowerCase().includes("already registered")) {
        setServerError("An account with this email already exists. Try logging in instead.");
      } else {
        setServerError(error.message);
      }
      return;
    }

    // profiles row is created by a DB trigger on auth.users insert in production;
    // as a fallback, upsert it here in case the trigger isn't set up yet.
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: form.fullName.trim(),
        email,
        mobile: form.mobile.trim(),
      });
    }

    setSubmitting(false);

    if (data.session) {
      router.push("/onboarding");
    } else {
      // Email confirmation is enabled on this Supabase project.
      router.push("/login?confirm=1");
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-ink p-12 text-white md:flex">
        <div>
          <span className="font-display text-2xl font-semibold">BizGrow AI</span>
          <p className="mt-2 text-white/60">Your AI Business Growth Assistant</p>
        </div>
        <div className="space-y-4">
          {[
            "Daily Growth Suggestions",
            "AI Marketing Videos",
            "Lead & Customer Management",
            "Smart Follow-ups",
            "Business Insights",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 text-sm text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400" /> {f}
            </div>
          ))}
        </div>
        <div className="flex gap-2 text-xs">
          {["7 Days Free", "No Card Required", "Secure"].map((b) => (
            <span key={b} className="rounded-full border border-white/20 px-3 py-1">{b}</span>
          ))}
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold">Start your 7-day free trial</h1>
          <p className="mt-1 text-sm text-ink/60">No credit card required.</p>

          {serverError && (
            <p role="alert" className="mt-4 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
              {serverError}
            </p>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="fullName">Full Name</label>
              <input id="fullName" className="input" value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)} autoComplete="name" />
              {errors.fullName && <p className="mt-1 text-xs text-danger">{errors.fullName}</p>}
            </div>

            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input" value={form.email}
                onChange={(e) => update("email", e.target.value)} autoComplete="email" />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
            </div>

            <div>
              <label className="label" htmlFor="mobile">Mobile Number</label>
              <input id="mobile" inputMode="numeric" className="input" value={form.mobile}
                onChange={(e) => update("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="98765 43210" autoComplete="tel" />
              {errors.mobile && <p className="mt-1 text-xs text-danger">{errors.mobile}</p>}
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" className="input" value={form.password}
                onChange={(e) => update("password", e.target.value)} autoComplete="new-password" />
              {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
            </div>

            <div>
              <label className="label" htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" type="password" className="input" value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)} autoComplete="new-password" />
              {errors.confirmPassword && <p className="mt-1 text-xs text-danger">{errors.confirmPassword}</p>}
            </div>

            <label className="flex items-start gap-2 text-sm text-ink/70">
              <input type="checkbox" className="mt-0.5" checked={form.acceptedTerms}
                onChange={(e) => update("acceptedTerms", e.target.checked)} />
              I agree to the Terms of Service and Privacy Policy.
            </label>
            {errors.acceptedTerms && <p className="text-xs text-danger">{errors.acceptedTerms}</p>}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Creating your account..." : "Start 7 Days Free"}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-ink/60">
            Already have an account? <Link href="/login" className="font-semibold text-brand-500">Log in</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
