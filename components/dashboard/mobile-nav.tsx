"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/marketing", label: "Marketing" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-white md:hidden">
      {NAV.map((item) => {
        const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 py-3 text-center text-xs font-medium ${active ? "text-brand-600" : "text-ink/50"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
