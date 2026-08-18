import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/plans", label: "Plans & Pricing" },
  { href: "/admin/features", label: "Feature Control" },
  { href: "/admin/ai-settings", label: "AI Settings" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/faqs", label: "Help Center / FAQs" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!adminRow) redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-paper">
      <nav className="w-60 shrink-0 border-r border-line bg-ink p-4 text-white">
        <span className="mb-6 block px-2 font-display text-lg font-semibold">BizGrow AI Admin</span>
        <ul className="space-y-1">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
