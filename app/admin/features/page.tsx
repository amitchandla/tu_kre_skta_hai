"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FeatureFlag } from "@/lib/types";

export default function AdminFeaturesPage() {
  const supabase = createClient();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("feature_flags").select("*").order("key");
      setFlags(data ?? []);
    })();
  }, []);

  async function toggle(key: string, is_enabled: boolean) {
    setFlags((fs) => fs.map((f) => (f.key === key ? { ...f, is_enabled } : f)));
    await supabase.from("feature_flags").update({ is_enabled }).eq("key", key);
  }

  async function updateMessage(key: string, disabled_message: string) {
    setFlags((fs) => fs.map((f) => (f.key === key ? { ...f, disabled_message } : f)));
  }

  async function saveMessage(key: string, disabled_message: string) {
    await supabase.from("feature_flags").update({ disabled_message }).eq("key", key);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Feature Control</h1>
      <p className="mt-1 text-sm text-ink/60">Emergency switches — disable a feature instantly without a redeploy.</p>

      <div className="mt-6 space-y-3">
        {flags.map((f) => (
          <div key={f.key} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{f.label}</p>
                <p className="text-xs text-ink/40">{f.key}</p>
              </div>
              <button
                onClick={() => toggle(f.key, !f.is_enabled)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                  f.is_enabled ? "bg-accent-400/10 text-accent-500" : "bg-danger/10 text-danger"
                }`}
              >
                {f.is_enabled ? "ON" : "OFF"}
              </button>
            </div>
            <div className="mt-3">
              <label className="label">Message shown to users when OFF</label>
              <input
                className="input"
                value={f.disabled_message ?? ""}
                onChange={(e) => updateMessage(f.key, e.target.value)}
                onBlur={(e) => saveMessage(f.key, e.target.value)}
                placeholder="This feature is temporarily unavailable."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
