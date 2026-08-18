"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/marketing", label: "Marketing" },
  { href: "/dashboard/video-studio", label: "Video Studio" },
  { href: "/dashboard/ads", label: "Ads" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden w-56 shrink-0 border-r border-line bg-white p-4 md:block">
      <span className="mb-6 block px-2 font-display text-lg font-semibold">BizGrow AI</span>
      <ul className="space-y-1">
        {NAV.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-brand-50 text-brand-600" : "text-ink/60 hover:bg-paper hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
