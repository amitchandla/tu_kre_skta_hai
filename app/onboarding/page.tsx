"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  "Restaurant / Food", "Retail / Shop", "Salon / Beauty", "Clinic / Healthcare",
  "Education / Coaching", "Real Estate", "Services", "Manufacturing", "Other",
];

interface FormState {
  name: string;
  category: string;
  phone: string;
  whatsapp: string;
  city: string;
  state: string;
  area: string;
  address: string;
  website: string;
  instagram_handle: string;
  description: string;
  target_customers: string;
  current_offers: string;
}

const initial: FormState = {
  name: "", category: "", phone: "", whatsapp: "", city: "", state: "",
  area: "", address: "", website: "", instagram_handle: "", description: "",
  target_customers: "", current_offers: "",
};

const STEP_TITLES = ["Business Basics", "Location", "Customers & Offers", "Finish"];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (!form.name.trim()) return "Please enter your business name.";
      if (!form.category) return "Please choose a category.";
      if (!/^[6-9]\d{9}$/.test(form.phone.trim())) return "Enter a valid 10-digit phone number.";
    }
    if (step === 1) {
      if (!form.city.trim()) return "Please enter your business city.";
    }
    return null;
  }

  function next() {
    const err = validateStep();
    setError(err);
    if (err) return;
    setStep((s) => Math.min(s + 1, STEP_TITLES.length - 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function finish() {
    setSaving(true);
    setError(null);

    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) {
      setError("Your session expired. Please log in again.");
      setSaving(false);
      router.push("/login");
      return;
    }

    const { data: business, error: insertError } = await supabase
      .from("businesses")
      .insert({
        owner_id: user.id,
        name: form.name.trim(),
        category: form.category,
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim() || null,
        country: "India",
        state: form.state.trim() || null,
        city: form.city.trim(),
        area: form.area.trim() || null,
        address: form.address.trim() || null,
        website: form.website.trim() || null,
        instagram_handle: form.instagram_handle.trim() || null,
        description: form.description.trim() || null,
        target_customers: form.target_customers.trim() || null,
        current_offers: form.current_offers.trim() || null,
      })
      .select()
      .single();

    if (insertError || !business) {
      setError(insertError?.message ?? "Could not save your business. Please try again.");
      setSaving(false);
      return;
    }

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);

    await supabase.from("subscriptions").insert({
      business_id: business.id,
      plan_code: "trial",
      status: "trialing",
      trial_end: trialEnd.toISOString(),
    });

    await supabase
      .from("profiles")
      .update({ onboarding_complete: true })
      .eq("id", user.id);

    setSaving(false);
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-12">
      <div className="mx-auto max-w-xl">
        <span className="font-display text-xl font-semibold">BizGrow AI</span>
        <h1 className="mt-2 text-2xl font-semibold">Let's Set Up Your Business</h1>

        <div className="mt-6 flex gap-2">
          {STEP_TITLES.map((t, i) => (
            <div key={t} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-brand-500" : "bg-line"}`} />
          ))}
        </div>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink/50">{STEP_TITLES[step]}</p>

        <div className="card mt-6 p-6">
          {error && <p role="alert" className="mb-4 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="label">Business Name</label>
                <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Golden Pizza" />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={(e) => update("category", e.target.value)}>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Phone / WhatsApp</label>
                <input className="input" value={form.phone} inputMode="numeric"
                  onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="98765 43210" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-ink/60">Where is your business located? This can be different from your current location.</p>
              <div>
                <label className="label">City</label>
                <input className="input" value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Rohtak" />
              </div>
              <div>
                <label className="label">State</label>
                <input className="input" value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="Haryana" />
              </div>
              <div>
                <label className="label">Area / Locality (optional)</label>
                <input className="input" value={form.area} onChange={(e) => update("area", e.target.value)} />
              </div>
              <div>
                <label className="label">Full Address (optional)</label>
                <input className="input" value={form.address} onChange={(e) => update("address", e.target.value)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="label">What does your business do? (optional)</label>
                <textarea className="input" rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} />
              </div>
              <div>
                <label className="label">Who are your target customers? (optional)</label>
                <input className="input" value={form.target_customers} onChange={(e) => update("target_customers", e.target.value)} placeholder="Local families and students" />
              </div>
              <div>
                <label className="label">Current offers (optional)</label>
                <input className="input" value={form.current_offers} onChange={(e) => update("current_offers", e.target.value)} placeholder="Weekend Pizza Offer" />
              </div>
              <div>
                <label className="label">Instagram handle (optional)</label>
                <input className="input" value={form.instagram_handle} onChange={(e) => update("instagram_handle", e.target.value)} placeholder="@goldenpizza" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 text-sm">
              <p className="text-ink/70">Review before finishing — you can edit all of this later in Settings.</p>
              <div className="rounded-lg border border-line p-4">
                <p><span className="font-semibold">{form.name}</span> · {form.category}</p>
                <p className="text-ink/60">{[form.area, form.city, form.state].filter(Boolean).join(", ")}</p>
                <p className="text-ink/60">{form.phone}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button type="button" onClick={back} disabled={step === 0} className="btn-secondary disabled:opacity-0">
              Back
            </button>
            {step < STEP_TITLES.length - 1 ? (
              <button type="button" onClick={next} className="btn-primary">Continue</button>
            ) : (
              <button type="button" onClick={finish} disabled={saving} className="btn-primary">
                {saving ? "Setting up..." : "Finish Setup"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
