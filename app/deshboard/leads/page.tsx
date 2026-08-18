"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Lead } from "@/lib/types";

const STATUSES: Lead["status"][] = ["new", "contacted", "interested", "quotation", "won", "lost"];

const STATUS_LABEL: Record<Lead["status"], string> = {
  new: "New", contacted: "Contacted", interested: "Interested",
  quotation: "Quotation", won: "Won", lost: "Lost",
};

export default function LeadsPage() {
  const supabase = createClient();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [requirement, setRequirement] = useState("");
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
        .from("leads").select("*").eq("business_id", business.id).order("created_at", { ascending: false });
      setLeads(data ?? []);
      setLoading(false);
    })();
  }, []);

  async function addLead(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId) return;
    if (!name.trim()) { setError("Please enter a name."); return; }
    setError(null);

    const { data, error } = await supabase
      .from("leads")
      .insert({ business_id: businessId, name: name.trim(), phone: phone.trim() || null, requirement: requirement.trim() || null })
      .select().single();

    if (error) { setError(error.message); return; }
    setLeads((l) => [data as Lead, ...l]);
    setName(""); setPhone(""); setRequirement(""); setShowForm(false);
  }

  async function updateStatus(id: string, status: Lead["status"]) {
    setLeads((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));
    await supabase.from("leads").update({ status, last_contact_at: new Date().toISOString() }).eq("id", id);
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Leads</h1>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary">
          {showForm ? "Cancel" : "Add Lead"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addLead} className="card mt-4 space-y-3 p-4">
          {error && <p className="text-sm text-danger">{error}</p>}
          <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="input" placeholder="What do they need? (optional)" value={requirement} onChange={(e) => setRequirement(e.target.value)} />
          <button type="submit" className="btn-primary">Save Lead</button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-sm text-ink/50">Loading...</p>
        ) : leads.length === 0 ? (
          <p className="text-sm text-ink/50">No leads yet. Add your first lead to get started.</p>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{lead.name}</p>
                <p className="text-sm text-ink/60">{lead.phone || "No phone"} {lead.requirement ? `· ${lead.requirement}` : ""}</p>
              </div>
              <select
                className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
                value={lead.status}
                onChange={(e) => updateStatus(lead.id, e.target.value as Lead["status"])}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
