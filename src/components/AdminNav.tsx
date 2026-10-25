"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "ניקוב" },
  { href: "/admin/parents", label: "הורים" },
  { href: "/admin/settings", label: "הגדרות" },
];

export function AdminNav() {
  const p = usePathname();
  return (
    <nav className="nav" aria-label="ניווט מנהל">
      {items.map((i) => {
        const active = i.href === "/admin" ? p === "/admin" : p.startsWith(i.href);
        return <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined}>{i.label}</Link>;
      })}
    </nav>
  );
}
