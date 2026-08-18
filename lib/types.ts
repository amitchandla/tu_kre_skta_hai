// Hand-written subset of the schema used by the app.
// For full type safety, generate this instead with:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types.ts

export type Language = "en" | "hi" | "hinglish";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  mobile: string | null;
  preferred_language: Language;
  onboarding_complete: boolean;
  created_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  category: string;
  owner_name: string | null;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  country: string;
  state: string | null;
  city: string;
  area: string | null;
  address: string | null;
  website: string | null;
  instagram_handle: string | null;
  facebook_page: string | null;
  description: string | null;
  target_customers: string | null;
  usp: string | null;
  current_offers: string | null;
  brand_voice: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string | null;
  requirement: string | null;
  status: "new" | "contacted" | "interested" | "quotation" | "won" | "lost";
  notes: string | null;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  last_interaction_at: string | null;
  total_interactions: number;
  status: "active" | "inactive";
  created_at: string;
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  price_inr: number;
  billing_period: "monthly" | "yearly";
  trial_days: number;
  features: Record<string, unknown>;
  is_active: boolean;
  sort_order: number;
}

export interface Subscription {
  id: string;
  business_id: string;
  plan_code: string;
  status: "trialing" | "active" | "past_due" | "canceled" | "expired";
  trial_start: string;
  trial_end: string;
  current_period_end: string | null;
}

export interface FeatureFlag {
  key: string;
  label: string;
  is_enabled: boolean;
  plan_limits: Record<string, number>;
  disabled_message: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "critical";
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

export interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
  language: Language;
  sort_order: number;
  is_active: boolean;
}

export interface AiSetting {
  key: string;
  value: string;
  updated_at: string;
}

// Minimal Database generic so @supabase/ssr's generics don't error.
// Replace with a real generated type for full column-level safety.
export type Database = any;
