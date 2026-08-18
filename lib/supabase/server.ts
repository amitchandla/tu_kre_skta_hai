import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types";

/**
 * Server-side Supabase client (anon key + user's session cookie).
 * Use in Server Components, Server Actions, and Route Handlers.
 * RLS still applies — this does NOT bypass row level security.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component — safe to ignore when
            // middleware is also refreshing the session.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // See note above.
          }
        },
      },
    }
  );
}

/**
 * Admin/service-role client. SERVER-ONLY. Bypasses RLS.
 * Only ever import this inside app/api/** route handlers that have
 * already verified the caller is an authenticated admin_users row.
 * Never import this from a Server Component or expose it to the client.
 */
export function createServiceRoleClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() {
          return undefined;
        },
        set() {},
        remove() {},
      },
    }
  );
}
