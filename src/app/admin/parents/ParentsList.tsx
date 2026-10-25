"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ParentRow } from "@/lib/data";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/StatusBadge";

const left = (p: ParentRow) => (p.entries != null ? p.entries - p.used : null);

const FILTERS = [
  { id: "all", label: "הכל", test: () => true },
  { id: "unpaid", label: "לא שולם", test: (p: ParentRow) => p.paid === false },
  { id: "low", label: "נגמר בקרוב", test: (p: ParentRow) => { const l = left(p); return l !== null && l <= 1; } },
  { id: "none", label: "ללא כרטיסייה", test: (p: ParentRow) => p.entries == null },
] as const;

export function ParentsList({ parents }: { parents: ParentRow[] }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof FILTERS)[number]["id"]>("all");
  const shown = useMemo(() => {
    const s = q.trim();
    const test = FILTERS.find((x) => x.id === f)!.test;
    return parents.filter((p) => test(p) && (!s || `${p.parent_name} ${p.baby_name ?? ""} ${p.phone ?? ""} ${p.email}`.includes(s)));
  }, [q, f, parents]);

  if (parents.length === 0) {
    return <section className="card"><EmptyState icon="users" text="ההורה הראשון יופיע כאן. לחצו על ״הורה״ כדי להוסיף" /></section>;
  }
  return (
    <>
      <div className="search">
        <Icon name="search" />
        <input type="search" placeholder="חיפוש הורה, תינוק, טלפון או מייל" value={q} onChange={(e) => setQ(e.target.value)} aria-label="חיפוש" />
      </div>
      <div className="chips" role="group" aria-label="סינון">
        {FILTERS.map((x) => (
          <button key={x.id} type="button" className="chip" aria-pressed={f === x.id} onClick={() => setF(x.id)}>
            {x.label} <span className="count">· {parents.filter(x.test).length}</span>
          </button>
        ))}
      </div>
      <section className="card list-card">
        {shown.length === 0 ? (
          <EmptyState icon="search" text="אין הורים שמתאימים לסינון"
            action={<button type="button" className="btn" onClick={() => { setQ(""); setF("all"); }}>ניקוי סינון</button>} />
        ) : (
          <ul className="list">
            {shown.map((p) => {
              const l = left(p);
              return (
                <li key={p.id}>
                  <Link href={`/admin/parents/${p.id}`} className="plain-link grow">
                    <div><span className="strong">{p.parent_name}</span>{p.baby_name ? <span className="muted"> · {p.baby_name}</span> : null}</div>
                    <div className="faint ltr">{p.email}</div>
                  </Link>
                  {l === null ? <StatusBadge>ללא כרטיסייה</StatusBadge>
                    : <StatusBadge tone={p.paid ? "success" : "warning"}>{l} נותרו{p.paid ? "" : " · לא שולם"}</StatusBadge>}
                  <Icon name="chevronLeft" size="sm" />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
