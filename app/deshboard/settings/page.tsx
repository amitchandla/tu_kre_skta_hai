"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Business, Language, Subscription } from "@/lib/types";

export default function SettingsPage() {
  const supabase = createClient();
  const [business, setBusiness] = useState<Business | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return;

      const [{ data: biz }, { data: profile }] = await Promise.all([
        supabase.from("businesses").select("*").eq("owner_id", userRes.user.id).single(),
        supabase.from("profiles").select("preferred_language").eq("id", userRes.user.id).single(),
      ]);

      if (biz) {
        setBusiness(biz);
        const { data: sub } = await supabase
          .from("subscriptions").select("*").eq("business_id", biz.id).order("created_at", { ascending: false }).limit(1).single();
        setSubscription(sub);
      }
      if (profile) setLanguage(profile.preferred_language);
    })();
  }, []);

  async function saveBusiness(e: React.FormEvent) {
    e.preventDefault();
    if (!business) return;
    setSaving(true);
    await supabase.from("businesses").update({
      name: business.name,
      category: business.category,
      phone: business.phone,
      whatsapp: business.whatsapp,
      city: business.city,
      state: business.state,
      description: business.description,
      target_customers: business.target_customers,
      current_offers: business.current_offers,
    }).eq("id", business.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function changeLanguage(lang: Language) {
    setLanguage(lang);
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) return;
    await supabase.from("profiles").update({ preferred_language: lang }).eq("id", userRes.user.id);
  }

  if (!business) return <p className="text-sm text-ink/50">Loading...</p>;

  const trialDaysLeft = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
      </div>

      {subscription && (
        <section className="card p-5">
          <h2 className="font-semibold">Subscription</h2>
          <p className="mt-2 text-sm text-ink/70">
            Plan: <span className="font-medium capitalize">{subscription.plan_code}</span> · Status: <span className="font-medium capitalize">{subscription.status}</span>
          </p>
          {subscription.status === "trialing" && (
            <p className="mt-1 text-sm text-ink/70">
              {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left in your free trial.
            </p>
          )}
        </section>
      )}

      <section className="card p-5">
        <h2 className="font-semibold">Language</h2>
        <p className="mt-1 text-sm text-ink/60">This changes the language of AI suggestions, captions and help content.</p>
        <div className="mt-3 flex gap-2">
          {(["en", "hi", "hinglish"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => changeLanguage(l)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                language === l ? "border-brand-500 bg-brand-50 text-brand-600" : "border-line text-ink/60"
              }`}
            >
              {l === "en" ? "English" : l === "hi" ? "हिन्दी" : "Hinglish"}
            </button>
          ))}
        </div>
      </section>

      <form onSubmit={saveBusiness} className="card space-y-4 p-5">
        <h2 className="font-semibold">Business Brain</h2>
        <div>
          <label className="label">Business Name</label>
          <input className="input" value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} />
        </div>
        <div>
          <label className="label">City</label>
          <input className="input" value={business.city} onChange={(e) => setBusiness({ ...business, city: e.target.value })} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} value={business.description ?? ""} onChange={(e) => setBusiness({ ...business, description: e.target.value })} />
        </div>
        <div>
          <label className="label">Current offers</label>
          <input className="input" value={business.current_offers ?? ""} onChange={(e) => setBusiness({ ...business, current_offers: e.target.value })} />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
