import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI content generation is not configured yet. Add ANTHROPIC_API_KEY on the server to enable this feature." },
      { status: 503 }
    );
  }

  const { contentType } = await request.json(); // 'reel' | 'post' | 'story'

  const { data: business } = await supabase
    .from("businesses")
    .select("name, category, description, target_customers, current_offers, city")
    .eq("owner_id", user.id)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_language")
    .eq("id", user.id)
    .single();

  if (!business) {
    return NextResponse.json({ error: "No business found. Please complete onboarding first." }, { status: 400 });
  }

  const { data: aiSettings } = await supabase
    .from("ai_settings")
    .select("key, value")
    .in("key", ["system_instructions", "language_behavior"]);

  const systemPrompt = (aiSettings ?? []).map((s) => s.value).join("\n\n");
  const languageMap = { en: "English", hi: "Hindi", hinglish: "Hinglish (mix of Hindi and English, written in Roman script)" };
  const language = languageMap[(profile?.preferred_language as keyof typeof languageMap) || "en"];

  const userPrompt = `Business: ${business.name} (${business.category}) in ${business.city}.
Description: ${business.description || "not provided"}.
Target customers: ${business.target_customers || "not specified"}.
Current offer: ${business.current_offers || "none"}.

Write a short, specific ${contentType} idea for today, in ${language}. Include: a one-line concept, and a ready-to-use caption under 40 words. Do not invent facts about the business that were not given above.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `AI provider error: ${text}` }, { status: 502 });
    }

    const data = await res.json();
    const text = data.content?.map((b: { text?: string }) => b.text ?? "").join("\n") ?? "";

    return NextResponse.json({ suggestion: text });
  } catch (err) {
    return NextResponse.json({ error: "Could not reach the AI provider. Please try again." }, { status: 502 });
  }
}
