import { createClient } from "@/lib/supabase/server";
import { buildGrowthPlan } from "@/lib/growth-advisor";
import Link from "next/link";

export default async function DashboardOverview() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user!.id)
    .single();

  const [plan, { data: announcements }, { data: flag }] = await Promise.all([
    buildGrowthPlan(supabase, business!.id),
    supabase
      .from("announcements")
      .select("id, title, message, type")
      .eq("is_active", true)
      .lte("start_date", new Date().toISOString())
      .order("start_date", { ascending: false })
      .limit(3),
    supabase.from("feature_flags").select("is_enabled").eq("key", "daily_growth_advisor").single(),
  ]);

  const advisorEnabled = flag?.is_enabled ?? true;
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Good to see you, {firstName}</h1>
        <p className="text-ink/60">Here's what your business should focus on today.</p>
      </div>

      {announcements?.map((a) => (
        <div key={a.id} className="rounded-lg border border-line bg-white px-4 py-3 text-sm">
          <span className="font-semibold">{a.title}</span> — {a.message}
        </div>
      ))}

      <section className="card p-6">
        <h2 className="font-semibold">Today's Growth Plan</h2>

        {!advisorEnabled ? (
          <p className="mt-4 text-sm text-ink/60">This feature is temporarily unavailable.</p>
        ) : plan.length === 0 ? (
          <p className="mt-4 text-sm text-ink/60">
            No urgent actions right now — add some leads or customers and BizGrow AI will start suggesting what to do next.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {plan.map((item) => (
              <li key={item.id} className="rounded-lg border border-line p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-ink">{item.title}</p>
                    <p className="mt-1 text-sm text-ink/60">{item.why}</p>
                  </div>
                  <Link href={item.href} className="shrink-0 whitespace-nowrap text-sm font-semibold text-brand-500">
                    {item.action} →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
