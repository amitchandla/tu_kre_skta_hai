"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
  const supabase = createClient();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return;
      const { data: business } = await supabase
        .from("businesses").select("id").eq("owner_id", userRes.user.id).single();
      if (!business) return;
      setBusinessId(business.id);
      const { data } = await supabase
        .from("customers").select("*").eq("business_id", business.id).order("created_at", { ascending: false });
      setCustomers(data ?? []);
      setLoading(false);
    })();
  }, []);

  async function addCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId) return;
    if (!name.trim()) { setError("Please enter a name."); return; }
    setError(null);

    const { data, error } = await supabase
      .from("customers")
      .insert({ business_id: businessId, name: name.trim(), phone: phone.trim() || null, last_interaction_at: new Date().toISOString() })
      .select().single();

    if (error) { setError(error.message); return; }
    setCustomers((c) => [data as Customer, ...c]);
    setName(""); setPhone(""); setShowForm(false);
  }

  const inactiveThreshold = Date.now() - 30 * 24 * 60 * 60 * 1000;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Customers</h1>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary">
          {showForm ? "Cancel" : "Add Customer"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addCustomer} className="card mt-4 space-y-3 p-4">
          {error && <p className="text-sm text-danger">{error}</p>}
          <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button type="submit" className="btn-primary">Save Customer</button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-sm text-ink/50">Loading...</p>
        ) : customers.length === 0 ? (
          <p className="text-sm text-ink/50">No customers yet. Add your first customer to get started.</p>
        ) : (
          customers.map((c) => {
            const isInactive = c.last_interaction_at ? new Date(c.last_interaction_at).getTime() < inactiveThreshold : true;
            return (
              <div key={c.id} className="card flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-ink/60">{c.phone || "No phone"}</p>
                </div>
                {isInactive && (
                  <span className="rounded-full bg-warn/10 px-3 py-1 text-xs font-semibold text-warn">Hasn't returned in 30+ days</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
