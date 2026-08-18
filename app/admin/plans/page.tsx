"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Plan } from "@/lib/types";

export default function AdminPlansPage() {
  const supabase = createClient();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("plans").select("*").order("sort_order");
      setPlans(data ?? []);
    })();
  }, []);

  function update(id: string, patch: Partial<Plan>) {
    setPlans((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  async function save(plan: Plan) {
    setSavingId(plan.id);
    await supabase
      .from("plans")
      .update({
        name: plan.name,
        price_inr: plan.price_inr,
        trial_days: plan.trial_days,
        is_active: plan.is_active,
      })
      .eq("id", plan.id);
    setSavingId(null);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Plans & Pricing</h1>
      <p className="mt-1 text-sm text-ink/60">Changes here apply everywhere in the app immediately — no deploy needed.</p>

      <div className="mt-6 space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className="card grid gap-3 p-5 md:grid-cols-5 md:items-end">
            <div>
              <label className="label">Plan code</label>
              <p className="rounded-lg bg-paper px-3 py-2 text-sm text-ink/60">{plan.code}</p>
            </div>
            <div>
              <label className="label">Name</label>
              <input className="input" value={plan.name} onChange={(e) => update(plan.id, { name: e.target.value })} />
            </div>
            <div>
              <label className="label">Price (₹/month)</label>
              <input type="number" className="input" value={plan.price_inr}
                onChange={(e) => update(plan.id, { price_inr: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Trial days</label>
              <input type="number" className="input" value={plan.trial_days}
                onChange={(e) => update(plan.id, { trial_days: Number(e.target.value) })} />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={plan.is_active} onChange={(e) => update(plan.id, { is_active: e.target.checked })} />
                Active
              </label>
              <button onClick={() => save(plan)} disabled={savingId === plan.id} className="btn-primary text-sm">
                {savingId === plan.id ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
