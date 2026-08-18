import { createClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  const supabase = createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: businesses } = await supabase
    .from("businesses")
    .select("owner_id, name");

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("business_id, plan_code, status, trial_end");

  const businessByOwner = new Map((businesses ?? []).map((b) => [b.owner_id, b]));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Users</h1>
      <div className="mt-6 overflow-x-auto card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-ink/50">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Business</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => {
              const biz = businessByOwner.get(p.id);
              const sub = biz ? subs?.find((s) => s.business_id === (biz as any).id) : undefined;
              return (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">{p.full_name}</td>
                  <td className="px-4 py-3">{p.email}</td>
                  <td className="px-4 py-3">{biz?.name ?? "—"}</td>
                  <td className="px-4 py-3 capitalize">{sub?.plan_code ?? "—"}</td>
                  <td className="px-4 py-3 capitalize">{sub?.status ?? "—"}</td>
                  <td className="px-4 py-3">{new Date(p.created_at).toLocaleDateString("en-IN")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
