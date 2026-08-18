"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Announcement } from "@/lib/types";

export default function AdminAnnouncementsPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<Announcement["type"]>("info");

  async function load() {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    await supabase.from("announcements").insert({ title, message, type, start_date: new Date().toISOString() });
    setTitle(""); setMessage(""); setType("info");
    load();
  }

  async function toggleActive(id: string, is_active: boolean) {
    setItems((its) => its.map((i) => (i.id === id ? { ...i, is_active } : i)));
    await supabase.from("announcements").update({ is_active }).eq("id", id);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold">Announcements</h1>

      <form onSubmit={create} className="card mt-6 space-y-3 p-5">
        <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="input" placeholder="Message" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} />
        <select className="input" value={type} onChange={(e) => setType(e.target.value as Announcement["type"])}>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="success">Success</option>
          <option value="critical">Critical</option>
        </select>
        <button type="submit" className="btn-primary">Publish Announcement</button>
      </form>

      <div className="mt-6 space-y-3">
        {items.map((a) => (
          <div key={a.id} className="card flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{a.title}</p>
              <p className="text-sm text-ink/60">{a.message}</p>
            </div>
            <button
              onClick={() => toggleActive(a.id, !a.is_active)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${a.is_active ? "bg-accent-400/10 text-accent-500" : "bg-line text-ink/50"}`}
            >
              {a.is_active ? "Active" : "Inactive"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
