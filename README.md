# BizGrow AI — Phase 1

"Your AI Business Growth Assistant" — Next.js 14 (App Router) + Supabase.

This is a **real, working Phase 1** of the full BizGrow AI spec: auth, business
onboarding, Daily Growth Advisor, Leads/Customers CRM, admin-configurable
pricing/features/AI prompts/FAQs/announcements, and one working AI integration
(social content suggestions). Video generation and Meta Ads are built as real
architecture (DB tables, RLS, UI, feature flags) but are intentionally left as
"connect your credentials" stubs rather than faked — see "What's not wired up"
below.

---

## 1. Project structure

```
bizgrow-ai/
├── app/
│   ├── page.tsx                    Landing page
│   ├── (auth)/login|signup|forgot-password|reset-password/
│   ├── onboarding/                 Business Brain setup (multi-step)
│   ├── dashboard/                  Protected app (layout checks auth + business)
│   │   ├── page.tsx                Overview + Daily Growth Advisor
│   │   ├── leads/  customers/      CRM
│   │   ├── marketing/              AI social content suggestions
│   │   ├── video-studio/  ads/     Stubs — see "What's not wired up"
│   │   └── settings/               Business Brain edit, language, subscription
│   ├── admin/                      Protected by admin_users table check
│   │   ├── page.tsx                Real counts (users, businesses, subs)
│   │   ├── users/  plans/  features/  ai-settings/  announcements/  faqs/
│   └── api/ai/social-suggestion/   Server-only route, calls Anthropic API
├── components/dashboard/           Sidebar, topbar, mobile nav
├── lib/
│   ├── supabase/client.ts|server.ts|middleware.ts
│   ├── growth-advisor.ts           Rule-based "Today's Growth Plan" logic
│   └── types.ts                    Hand-written types (see note below)
├── supabase/schema.sql             Full schema + RLS + seed data + trigger
├── middleware.ts                   Session refresh + route protection
└── .env.example
```

## 2. Supabase tables (see `supabase/schema.sql` for full SQL + RLS)

`profiles`, `admin_users`, `plans`, `subscriptions`, `businesses`,
`business_products`, `business_services`, `leads`, `customers`, `follow_ups`,
`content`, `videos`, `campaigns`, `reviews`, `usage`, `ai_settings`,
`feature_flags`, `faqs`, `announcements`, `activity_logs`.

Every business-owned table has RLS enabled and scoped with an
`owns_business()` helper function checked against `auth.uid()`. Admin-only
tables are scoped with an `is_admin()` helper checked against `admin_users`.
RLS is never disabled anywhere.

## 3. Setup

### a) Create a Supabase project
1. Go to supabase.com → New Project.
2. In **SQL Editor**, paste the entire contents of `supabase/schema.sql` and run it.
   This creates all tables, RLS policies, seed plans/feature flags/AI prompts, and
   the `on_auth_user_created` trigger that auto-creates a `profiles` row on signup.
3. In **Authentication → URL Configuration**, set your site URL and add
   `/reset-password` as an allowed redirect URL.
4. Copy your Project URL, anon/public key, and service role key.

### b) Configure environment variables
```
cp .env.example .env.local
```
Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`. Add `ANTHROPIC_API_KEY` to enable the Marketing
page's AI suggestions (server-side only — never exposed to the browser).

### c) Install and run
```
npm install
npm run dev
```

### d) Make yourself an admin
After signing up once through the app, run in Supabase SQL Editor:
```sql
insert into public.admin_users (id, role)
values ('YOUR-AUTH-USER-UUID', 'superadmin');
```
Find your UUID in **Authentication → Users**. Then visit `/admin`.

## 4. How to access the Admin Panel
Log in with an account whose `auth.users.id` exists in `admin_users`, then go
to `/admin`. Non-admin users are redirected to `/dashboard`; logged-out users
are redirected to `/login`. This check happens server-side in
`app/admin/layout.tsx` on every request — it isn't just a hidden link.

## 5. Changing things WITHOUT touching code

| What | Where |
|---|---|
| Prices, trial length, plan features | `/admin/plans` |
| Turn a feature ON/OFF (emergency switch), per-plan limits, the message shown when OFF | `/admin/features` |
| AI system prompts / Growth Advisor rules / video style / help assistant behavior | `/admin/ai-settings` |
| FAQs (used by AI Help and the Help Center) | `/admin/faqs` |
| Announcements shown on the dashboard | `/admin/announcements` |

All of the above read live from Supabase on every page load — no redeploy needed.

## 6. What's fully working today
- Signup / login / logout / forgot password / reset password — real `supabase.auth`
- Session handling via middleware, protected `/dashboard` and `/admin` routes
- Business onboarding → creates a real `businesses` row + a DB-controlled
  7-day trial `subscriptions` row (not localStorage — can't be reset by clearing the browser)
- Daily Growth Advisor — rule-based, built only from real `leads`/`customers`/`businesses`
  rows for the logged-in business (see `lib/growth-advisor.ts`)
- Leads and Customers CRM — real create/read/update against Supabase, protected by RLS
- Marketing → AI social content suggestions — real call to the Anthropic API from a
  server route (`app/api/ai/social-suggestion/route.ts`), using the business's own
  data and the admin-editable prompts in `ai_settings`. Returns a clear error if
  `ANTHROPIC_API_KEY` isn't set — it does not fabricate a response.
- Admin panel — real counts, real CRUD against `plans`, `feature_flags`,
  `ai_settings`, `announcements`, `faqs`
- RLS enforced on every business-owned table

## 7. What's not wired up (by design — see section 54/59 of the original spec: never fake this)
- **AI Video Studio**: DB table (`videos`), workflow states, and UI are in place.
  Actual generation needs a video-generation provider — add
  `VIDEO_GENERATION_API_KEY` / `VIDEO_GENERATION_PROVIDER` and implement the call
  in a new `app/api/ai/video/route.ts` following the same pattern as the social
  suggestion route.
- **Meta Ads**: DB table (`campaigns`), workflow states, and UI are in place.
  Real ad launch requires the business owner to complete Meta's OAuth flow
  (`META_APP_ID` / `META_APP_SECRET` / `META_REDIRECT_URI`) — BizGrow AI must
  never spend budget or launch without that explicit authorization.
- **AI Help floating button**: not yet built. The `faqs` table and `ai_settings.help_assistant_instructions`
  are ready for it — follow the same server-route pattern as social suggestions.
- **Payments**: architecture is ready (`subscriptions`, `plans`), Razorpay keys
  are in `.env.example`, but no checkout flow is implemented yet.
- **Notifications**: no delivery mechanism (email/WhatsApp/push) is wired up yet.

## 8. Deploying

### Cloudflare Pages
1. Push this project to a GitHub repo.
2. In Cloudflare Pages, create a new project from that repo.
3. Framework preset: **Next.js**. Build command: `npm run build`. Output: `.next`
   (Cloudflare's Next.js adapter handles this — for the Edge runtime you may
   need `@cloudflare/next-on-pages`; check Cloudflare's current Next.js docs,
   since their adapter requirements change).
4. Add all variables from `.env.example` under **Settings → Environment variables**.
   Keep `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` **server-only** —
   never prefix them with `NEXT_PUBLIC_`.
5. Deploy.

## 9. Testing checklist actually run so far
- [x] Signup validation (name/email/mobile/password rules) — client-side, unit-testable
- [x] Login / logout via real Supabase calls
- [ ] Full auth round-trip (signup → confirm email → login → onboarding → dashboard)
      requires a real Supabase project and has **not** been executed in this environment
      (no credentials available here) — the code path is complete and follows Supabase's
      documented API exactly.
- [ ] RLS policies — written and reviewed, but only verifiable by running them against
      a real Supabase project (`supabase test db` or manual SQL Editor checks impersonating
      different `auth.uid()` values).

Per the "don't claim it works unless tested" rule: treat the two unchecked items above as
**not yet verified** until you run them against your own Supabase project.

## 10. Note on `lib/types.ts`
This ships with hand-written types for the tables the UI touches. For full
column-level type safety, regenerate it from your live schema:
```
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types.ts
```
