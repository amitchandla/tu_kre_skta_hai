-- ============================================================================
-- BIZGROW AI — Supabase schema (Phase 1)
-- Run this in Supabase SQL Editor (or `supabase db push` with the CLI).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. PROFILES  (one row per auth.users row)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  mobile text,
  preferred_language text not null default 'en' check (preferred_language in ('en','hi','hinglish')),
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. ADMIN USERS  (separate allowlist — NOT a role on profiles)
-- ----------------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin','superadmin')),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. PLANS  (admin-editable pricing/limits — never hard-code in frontend)
-- ----------------------------------------------------------------------------
create table if not exists public.plans (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,              -- 'trial' | 'starter' | 'growth' | 'pro'
  name text not null,
  price_inr integer not null default 0,
  billing_period text not null default 'monthly' check (billing_period in ('monthly','yearly')),
  trial_days integer not null default 7,
  features jsonb not null default '{}',   -- {"videos_per_month":5,"leads_limit":null,...}
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. SUBSCRIPTIONS  (per business, server/DB controlled trial)
-- ----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null,
  plan_code text not null references public.plans(code),
  status text not null default 'trialing' check (status in ('trialing','active','past_due','canceled','expired')),
  trial_start timestamptz not null default now(),
  trial_end timestamptz not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. BUSINESSES  ("Business Brain")
-- ----------------------------------------------------------------------------
create table if not exists public.businesses (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text not null,
  owner_name text,
  phone text not null,
  whatsapp text,
  email text,
  country text not null default 'India',
  state text,
  city text not null,
  area text,
  address text,
  website text,
  instagram_handle text,
  facebook_page text,
  description text,
  target_customers text,
  usp text,
  current_offers text,
  opening_hours jsonb,
  brand_voice text,
  brand_colors jsonb,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_products (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  price numeric,
  cost numeric,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.business_services (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  price numeric,
  description text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. LEADS
-- ----------------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  source text,
  requirement text,
  status text not null default 'new' check (status in ('new','contacted','interested','quotation','won','lost')),
  notes text,
  last_contact_at timestamptz,
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 7. CUSTOMERS
-- ----------------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  source text,
  last_purchase_note text,
  last_interaction_at timestamptz,
  total_interactions integer not null default 0,
  status text not null default 'active' check (status in ('active','inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 8. FOLLOW-UPS
-- ----------------------------------------------------------------------------
create table if not exists public.follow_ups (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  type text not null,                 -- 'new_lead' | 'quote' | 'thank_you' | 'review_request' | ...
  message text,
  status text not null default 'pending' check (status in ('pending','sent','done','skipped')),
  scheduled_for timestamptz,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 9. CONTENT  (captions/posts generated for the business)
-- ----------------------------------------------------------------------------
create table if not exists public.content (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  type text not null,                 -- 'reel' | 'post' | 'story' | 'whatsapp_status' | 'facebook_post' | 'youtube_short'
  language text not null default 'en',
  title text,
  body text,
  status text not null default 'draft' check (status in ('draft','approved','archived')),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 10. VIDEOS  (AI Video Studio — architecture ready, generation gated by feature flag)
-- ----------------------------------------------------------------------------
create table if not exists public.videos (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  use_cases text[] not null default '{}',   -- ['instagram_reel','instagram_story','meta_ad','whatsapp_status','youtube_short']
  concept text,
  script text,
  status text not null default 'draft' check (status in ('draft','generating','ready','approved','failed')),
  source_asset_urls text[] default '{}',
  output_url text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 11. CAMPAIGNS  (Meta Ads — architecture ready, launch gated on real Meta auth)
-- ----------------------------------------------------------------------------
create table if not exists public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  goal text not null,                 -- 'leads' | 'whatsapp' | 'website_visits' | 'sales'
  budget_inr numeric,
  duration_days integer,
  target_location text,
  target_customer text,
  ad_copy text,
  headline text,
  cta text,
  status text not null default 'draft' check (status in ('draft','pending_meta_auth','pending_approval','live','paused','ended')),
  meta_campaign_id text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 12. REVIEWS
-- ----------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  rating integer check (rating between 1 and 5),
  feedback_text text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 13. USAGE  (per-business, per-feature counters for plan limits)
-- ----------------------------------------------------------------------------
create table if not exists public.usage (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  feature_key text not null,          -- 'videos' | 'ai_help_messages' | 'content_generations'
  period_start date not null,
  count integer not null default 0,
  unique (business_id, feature_key, period_start)
);

-- ----------------------------------------------------------------------------
-- 14. AI SETTINGS  (admin-editable prompts/instructions — no redeploy needed)
-- ----------------------------------------------------------------------------
create table if not exists public.ai_settings (
  key text primary key,               -- 'system_instructions' | 'growth_advisor_rules' | 'video_style' | 'help_assistant' | ...
  value text not null,
  updated_by uuid references public.admin_users(id),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 15. FEATURE FLAGS  (admin ON/OFF + per-plan availability + limits)
-- ----------------------------------------------------------------------------
create table if not exists public.feature_flags (
  key text primary key,               -- 'video_generator' | 'meta_ads' | 'ai_help' | ...
  label text not null,
  is_enabled boolean not null default true,
  plan_limits jsonb not null default '{}',  -- {"starter":5,"growth":25,"pro":100}
  disabled_message text,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 16. FAQS
-- ----------------------------------------------------------------------------
create table if not exists public.faqs (
  id uuid primary key default uuid_generate_v4(),
  category text not null default 'general',
  question text not null,
  answer text not null,
  language text not null default 'en',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 17. ANNOUNCEMENTS
-- ----------------------------------------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info','warning','success','critical')),
  start_date timestamptz not null default now(),
  end_date timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 18. ACTIVITY LOGS  (for admin visibility + weekly reports; never fabricated)
-- ----------------------------------------------------------------------------
create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.businesses enable row level security;
alter table public.business_products enable row level security;
alter table public.business_services enable row level security;
alter table public.leads enable row level security;
alter table public.customers enable row level security;
alter table public.follow_ups enable row level security;
alter table public.content enable row level security;
alter table public.videos enable row level security;
alter table public.campaigns enable row level security;
alter table public.reviews enable row level security;
alter table public.usage enable row level security;
alter table public.ai_settings enable row level security;
alter table public.feature_flags enable row level security;
alter table public.faqs enable row level security;
alter table public.announcements enable row level security;
alter table public.activity_logs enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from public.admin_users where id = auth.uid());
$$;

-- Helper: does the current user own this business?
create or replace function public.owns_business(target_business_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.businesses
    where id = target_business_id and owner_id = auth.uid()
  );
$$;

-- ---- profiles ----
create policy "profiles_select_own" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles for insert with check (id = auth.uid());

-- ---- admin_users ---- (readable only by admins; writes only via service role / SQL)
create policy "admin_users_select_admin" on public.admin_users for select using (public.is_admin());

-- ---- plans, faqs, announcements, feature_flags ---- (public read, admin write)
create policy "plans_select_all" on public.plans for select using (true);
create policy "plans_write_admin" on public.plans for all using (public.is_admin()) with check (public.is_admin());

create policy "faqs_select_active" on public.faqs for select using (is_active = true or public.is_admin());
create policy "faqs_write_admin" on public.faqs for all using (public.is_admin()) with check (public.is_admin());

create policy "announcements_select_active" on public.announcements for select using (true);
create policy "announcements_write_admin" on public.announcements for all using (public.is_admin()) with check (public.is_admin());

create policy "feature_flags_select_all" on public.feature_flags for select using (true);
create policy "feature_flags_write_admin" on public.feature_flags for all using (public.is_admin()) with check (public.is_admin());

create policy "ai_settings_select_admin" on public.ai_settings for select using (public.is_admin());
create policy "ai_settings_write_admin" on public.ai_settings for all using (public.is_admin()) with check (public.is_admin());

-- ---- businesses ----
create policy "businesses_select_own" on public.businesses for select using (owner_id = auth.uid() or public.is_admin());
create policy "businesses_insert_own" on public.businesses for insert with check (owner_id = auth.uid());
create policy "businesses_update_own" on public.businesses for update using (owner_id = auth.uid());
create policy "businesses_delete_own" on public.businesses for delete using (owner_id = auth.uid());

-- ---- business-scoped tables: owner via businesses.owner_id, or admin ----
create policy "business_products_owner" on public.business_products for all
  using (public.owns_business(business_id) or public.is_admin())
  with check (public.owns_business(business_id));

create policy "business_services_owner" on public.business_services for all
  using (public.owns_business(business_id) or public.is_admin())
  with check (public.owns_business(business_id));

create policy "leads_owner" on public.leads for all
  using (public.owns_business(business_id) or public.is_admin())
  with check (public.owns_business(business_id));

create policy "customers_owner" on public.customers for all
  using (public.owns_business(business_id) or public.is_admin())
  with check (public.owns_business(business_id));

create policy "follow_ups_owner" on public.follow_ups for all
  using (public.owns_business(business_id) or public.is_admin())
  with check (public.owns_business(business_id));

create policy "content_owner" on public.content for all
  using (public.owns_business(business_id) or public.is_admin())
  with check (public.owns_business(business_id));

create policy "videos_owner" on public.videos for all
  using (public.owns_business(business_id) or public.is_admin())
  with check (public.owns_business(business_id));

create policy "campaigns_owner" on public.campaigns for all
  using (public.owns_business(business_id) or public.is_admin())
  with check (public.owns_business(business_id));

create policy "reviews_owner" on public.reviews for all
  using (public.owns_business(business_id) or public.is_admin())
  with check (public.owns_business(business_id));

create policy "usage_owner" on public.usage for select
  using (public.owns_business(business_id) or public.is_admin());

create policy "activity_logs_owner" on public.activity_logs for select
  using (public.owns_business(business_id) or public.is_admin());

-- ---- subscriptions ---- (readable by the owning business, writes via service role only)
alter table public.subscriptions enable row level security;
create policy "subscriptions_select_owner" on public.subscriptions for select
  using (public.owns_business(business_id) or public.is_admin());

-- ============================================================================
-- SEED DATA — safe defaults so the app is usable immediately after setup
-- ============================================================================

insert into public.plans (code, name, price_inr, trial_days, features, sort_order)
values
  ('trial', 'Free Trial', 0, 7, '{"videos_per_month":3,"leads_limit":50,"ai_help":true}', 0),
  ('starter', 'Starter', 999, 7, '{"videos_per_month":5,"leads_limit":200,"ai_help":true}', 1),
  ('growth', 'Growth', 2499, 7, '{"videos_per_month":25,"leads_limit":1000,"ai_help":true}', 2),
  ('pro', 'Pro', 4999, 7, '{"videos_per_month":100,"leads_limit":null,"ai_help":true}', 3)
on conflict (code) do nothing;

insert into public.feature_flags (key, label, is_enabled, plan_limits, disabled_message)
values
  ('daily_growth_advisor', 'Daily Growth Advisor', true, '{}', null),
  ('lead_crm', 'Lead & Customer CRM', true, '{}', null),
  ('ai_follow_up', 'AI Follow-up', true, '{}', null),
  ('social_suggestions', 'Social Media Suggestions', true, '{}', null),
  ('video_generator', 'AI Video Studio', false, '{"starter":5,"growth":25,"pro":100}',
    'Video generation is being set up for your account. This feature is temporarily unavailable.'),
  ('meta_ads', 'Meta Ads', false, '{}',
    'Meta Ads requires connecting a Meta Business account. This feature is temporarily unavailable.'),
  ('ai_help', 'AI Help Assistant', false, '{}',
    'AI Help is temporarily unavailable while we finish setup.')
on conflict (key) do nothing;

insert into public.ai_settings (key, value)
values
  ('system_instructions', 'You are BizGrow AI, a practical business growth assistant for small Indian businesses. Be specific, concrete, and never invent numbers you do not have.'),
  ('growth_advisor_rules', 'Prioritize: (1) leads with no contact in 2+ days, (2) customers inactive 30+ days, (3) one social media post for today, (4) any active offer that has not been promoted this week.'),
  ('video_style_instructions', 'Default to photorealistic, professional, commercial advertising style. Never cartoon-style unless explicitly requested.'),
  ('help_assistant_instructions', 'Answer only using the approved FAQ content and the user''s own business data. If unsure, say so and suggest contacting support.'),
  ('language_behavior', 'Respond in the user''s preferred_language (en/hi/hinglish). Keep language simple; never translate technical error codes.')
on conflict (key) do nothing;

insert into public.faqs (category, question, answer, language, sort_order)
values
  ('getting_started', 'How do I create my first Reel?', 'Go to Marketing → Social Media, tap "Create Reel", and BizGrow AI will use your Business Brain to suggest a concept, script and caption.', 'en', 1),
  ('getting_started', 'What should I post today?', 'Check "Today''s Growth Plan" on your dashboard — it lists the most relevant action for today based on your leads, customers and offers.', 'en', 2),
  ('billing', 'When does my trial end?', 'Your trial length and end date are shown under Settings → Subscription. You will be notified before it ends.', 'en', 3),
  ('crm', 'How do I add a customer?', 'Go to Customers → Add Customer and fill in their name and phone number. Everything else is optional.', 'en', 4)
on conflict do nothing;

-- ============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP (recommended — makes the client-side
-- upsert fallback in app/(auth)/signup/page.tsx unnecessary)
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, mobile)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    new.raw_user_meta_data->>'mobile'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
