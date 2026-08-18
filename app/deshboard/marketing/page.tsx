"use client";

import { useState } from "react";

const TYPES = [
  { key: "reel", label: "Instagram Reel" },
  { key: "post", label: "Instagram Post" },
  { key: "story", label: "Instagram Story" },
];

export default function MarketingPage() {
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function generate(type: string) {
    setLoadingType(type);
    setErrors((e) => ({ ...e, [type]: "" }));

    try {
      const res = await fetch("/api/ai/social-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors((e) => ({ ...e, [type]: data.error || "Something went wrong." }));
      } else {
        setResults((r) => ({ ...r, [type]: data.suggestion }));
      }
    } catch {
      setErrors((e) => ({ ...e, [type]: "Network error. Please try again." }));
    } finally {
      setLoadingType(null);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold">Marketing</h1>
      <p className="mt-1 text-ink/60">Content ideas built from your Business Brain — no prompt writing needed.</p>

      <div className="mt-6 space-y-4">
        {TYPES.map((t) => (
          <div key={t.key} className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{t.label}</h2>
              <button
                onClick={() => generate(t.key)}
                disabled={loadingType === t.key}
                className="btn-secondary text-sm"
              >
                {loadingType === t.key ? "Thinking..." : `Create ${t.label}`}
              </button>
            </div>
            {errors[t.key] && <p className="mt-3 text-sm text-danger">{errors[t.key]}</p>}
            {results[t.key] && (
              <p className="mt-3 whitespace-pre-wrap rounded-lg bg-paper p-4 text-sm text-ink/80">{results[t.key]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
