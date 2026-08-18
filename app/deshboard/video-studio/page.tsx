import { createClient } from "@/lib/supabase/server";

export default async function VideoStudioPage() {
  const supabase = createClient();
  const { data: flag } = await supabase
    .from("feature_flags")
    .select("is_enabled, disabled_message")
    .eq("key", "video_generator")
    .single();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold">AI Video Studio</h1>
      <p className="mt-1 text-ink/60">Photorealistic, commercial-style videos built from your real product photos.</p>

      <div className="card mt-6 p-6">
        {flag && !flag.is_enabled ? (
          <p className="text-sm text-ink/60">
            {flag.disabled_message || "This feature is temporarily unavailable."}
          </p>
        ) : (
          <p className="text-sm text-ink/60">
            Video generation requires connecting a video-generation provider
            (set <code className="rounded bg-paper px-1.5 py-0.5">VIDEO_GENERATION_API_KEY</code> and{" "}
            <code className="rounded bg-paper px-1.5 py-0.5">VIDEO_GENERATION_PROVIDER</code> in your environment). The
            database and workflow (concept → script → generate → preview → approve → export) are ready — wire up the
            provider call in <code className="rounded bg-paper px-1.5 py-0.5">app/api/ai/video/route.ts</code> once you have credentials.
          </p>
        )}
      </div>
    </div>
  );
}
