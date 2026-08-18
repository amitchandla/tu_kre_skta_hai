"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Faq } from "@/lib/types";

export default function AdminFaqsPage() {
  const supabase = createClient();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("general");

  async function load() {
    const { data } = await supabase.from("faqs").select("*").order("sort_order");
    setFaqs(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    await supabase.from("faqs").insert({ question, answer, category, language: "en" });
    setQuestion(""); setAnswer("");
    load();
  }

  async function remove(id: string) {
    setFaqs((f) => f.filter((x) => x.id !== id));
    await supabase.from("faqs").delete().eq("id", id);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold">Help Center / FAQs</h1>
      <p className="mt-1 text-sm text-ink/60">AI Help uses these approved answers first.</p>

      <form onSubmit={create} className="card mt-6 space-y-3 p-5">
        <input className="input" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input className="input" placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <textarea className="input" placeholder="Answer" rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} />
        <button type="submit" className="btn-primary">Add FAQ</button>
      </form>

      <div className="mt-6 space-y-3">
        {faqs.map((f) => (
          <div key={f.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{f.category}</p>
                <p className="mt-1 font-medium">{f.question}</p>
                <p className="mt-1 text-sm text-ink/60">{f.answer}</p>
              </div>
              <button onClick={() => remove(f.id)} className="shrink-0 text-xs font-semibold text-danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
