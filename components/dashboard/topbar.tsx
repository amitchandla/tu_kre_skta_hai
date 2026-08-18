"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function Topbar({ businessName }: { businessName: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-line bg-white px-6 py-4">
      <span className="font-semibold text-ink">{businessName}</span>
      <div className="flex items-center gap-4">
        <select className="rounded-lg border border-line bg-white px-2 py-1 text-sm" defaultValue="en" aria-label="Language">
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="hinglish">Hinglish</option>
        </select>
        <button onClick={handleLogout} className="text-sm font-semibold text-ink/60 hover:text-ink">
          Log out
        </button>
      </div>
    </header>
  );
}
