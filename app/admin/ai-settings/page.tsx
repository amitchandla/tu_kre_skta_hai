"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AiSetting } from "@/lib/types";

const LABELS: Record<string, string> = {
  system_instructions: "System Instructions",
  growth_advisor_rules: "Daily Growth Advisor Rules",
  video_style_instructions: "Video Style Instructions",
  help_assistant_instructions: "AI Help Assistant Instructions",
  language_behavior: "Language Behavior",
};

export default function AdminAiSettingsPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<AiSetting[]>([]);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("ai_settings").select("*").order("key");
      setSettings(data ?? []);
    })();
  }, []);

  function update(key: string, value: string) {
    setSettings((s) => s.map((x) => (x.key === key ? { ...x, value } : x)));
  }

  async function save(key: string, value: string) {
    setSavingKey(key);
    await supabase.from("ai_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key);
    setSavingKey(null);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold">AI Settings</h1>
      <p className="mt-1 text-sm text-ink/60">These prompts drive every AI feature. Edit them here — no code change required.</p>

      <div className="mt-6 space-y-5">
        {settings.map((s) => (
          <div key={s.key} className="card p-5">
            <label className="label">{LABELS[s.key] ?? s.key}</label>
            <textarea
              className="input"
              rows={4}
              value={s.value}
              onChange={(e) => update(s.key, e.target.value)}
            />
            <button onClick={() => save(s.key, s.value)} disabled={savingKey === s.key} className="btn-primary mt-2 text-sm">
              {savingKey === s.key ? "Saving..." : "Save"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
