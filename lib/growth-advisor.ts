import type { SupabaseClient } from "@supabase/supabase-js";

export interface GrowthSuggestion {
  id: string;
  title: string;
  why: string;
  action: string;
  href: string;
  priority: number; // lower = more urgent
}

/**
 * Builds "Today's Growth Plan" from real rows in Supabase — leads,
 * customers, follow-ups and the business's own offers. Nothing here is
 * invented: if a category has no data, it is simply omitted.
 *
 * This is intentionally rule-based rather than an LLM call, per the
 * product principle that Growth Advisor suggestions must be traceable
 * to real data. An LLM call (using the `growth_advisor_rules` row in
 * ai_settings) can be layered on top later to turn these into natural
 * language, in the user's preferred_language, via a server route.
 */
export async function buildGrowthPlan(
  supabase: SupabaseClient,
  businessId: string
): Promise<GrowthSuggestion[]> {
  const suggestions: GrowthSuggestion[] = [];
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: staleLeads }, { data: inactiveCustomers }, { data: business }, { data: recentContent }] =
    await Promise.all([
      supabase
        .from("leads")
        .select("id")
        .eq("business_id", businessId)
        .in("status", ["new", "contacted", "interested"])
        .or(`last_contact_at.is.null,last_contact_at.lt.${twoDaysAgo}`),
      supabase
        .from("customers")
        .select("id")
        .eq("business_id", businessId)
        .eq("status", "active")
        .or(`last_interaction_at.is.null,last_interaction_at.lt.${thirtyDaysAgo}`),
      supabase
        .from("businesses")
        .select("current_offers")
        .eq("id", businessId)
        .single(),
      supabase
        .from("content")
        .select("id")
        .eq("business_id", businessId)
        .gte("created_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()),
    ]);

  if (staleLeads && staleLeads.length > 0) {
    suggestions.push({
      id: "stale-leads",
      title: `${staleLeads.length} lead${staleLeads.length > 1 ? "s" : ""} need${staleLeads.length === 1 ? "s" : ""} follow-up`,
      why: "These leads haven't been contacted in 2 or more days — the longer you wait, the colder they get.",
      action: "Follow up now",
      href: "/dashboard/leads",
      priority: 1,
    });
  }

  if (!recentContent || recentContent.length === 0) {
    suggestions.push({
      id: "post-today",
      title: "Post something on social media today",
      why: "You haven't posted in the last 24 hours. Regular posting keeps your business visible.",
      action: "Create a post",
      href: "/dashboard/marketing",
      priority: 2,
    });
  }

  if (inactiveCustomers && inactiveCustomers.length > 0) {
    suggestions.push({
      id: "inactive-customers",
      title: `${inactiveCustomers.length} customer${inactiveCustomers.length > 1 ? "s" : ""} haven't returned recently`,
      why: "No interaction in 30+ days. A short, personal message can bring them back.",
      action: "Start reactivation",
      href: "/dashboard/customers",
      priority: 3,
    });
  }

  if (business?.current_offers && business.current_offers.trim()) {
    suggestions.push({
      id: "promote-offer",
      title: "Your current offer can be promoted",
      why: `You have an active offer set up: "${business.current_offers}". Make sure customers know about it this week.`,
      action: "Promote offer",
      href: "/dashboard/marketing",
      priority: 4,
    });
  }

  return suggestions.sort((a, b) => a.priority - b.priority);
}
