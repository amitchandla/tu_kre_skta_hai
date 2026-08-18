import { createClient } from "@/lib/supabase/server";

export default async function AdminOverview() {
  const supabase = createClient();

  const [{ count: totalUsers }, { count: totalBusinesses }, { count: trialing }, { count: active }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("businesses").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "trialing"),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
  ]);

  const stats = [
    { label: "Total Users", value: totalUsers ?? 0 },
    { label: "Total Businesses", value: totalBusinesses ?? 0 },
    { label: "Trial Subscriptions", value: trialing ?? 0 },
    { label: "Active Paid Subscriptions", value: active ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-2xl font-semibold">{s.value}</p>
            <p className="mt-1 text-sm text-ink/60">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
