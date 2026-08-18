import { createClient } from "@/lib/supabase/server";

export default async function AdsPage() {
  const supabase = createClient();
  const { data: flag } = await supabase
    .from("feature_flags")
    .select("is_enabled, disabled_message")
    .eq("key", "meta_ads")
    .single();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold">Meta Ads</h1>
      <p className="mt-1 text-ink/60">Campaign ideas, ad copy and audience suggestions — you approve before anything launches.</p>

      <div className="card mt-6 p-6">
        {flag && !flag.is_enabled ? (
          <p className="text-sm text-ink/60">
            {flag.disabled_message || "This feature is temporarily unavailable."}
          </p>
        ) : (
          <p className="text-sm text-ink/60">
            Launching real ads requires the business owner to connect their own Meta Business account
            (set <code className="rounded bg-paper px-1.5 py-0.5">META_APP_ID</code>,{" "}
            <code className="rounded bg-paper px-1.5 py-0.5">META_APP_SECRET</code> and{" "}
            <code className="rounded bg-paper px-1.5 py-0.5">META_REDIRECT_URI</code>). BizGrow AI will never spend
            advertising budget or launch a campaign without explicit authorization from the connected account.
          </p>
        )}
      </div>
    </div>
  );
}
