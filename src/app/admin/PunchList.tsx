"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { ParentRow } from "@/lib/data";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { PunchDots } from "@/components/PunchDots";
import { StatusBadge } from "@/components/StatusBadge";
import { UndoToast } from "@/components/UndoToast";
import { punch, voidVisit } from "./actions";

const UNDO_SEC = 10;
const TYPE_KEY = "punch-type";

export function PunchList({ parents, types }: { parents: ParentRow[]; types: { id: string; name: string }[] }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState(types[0]?.id ?? "");
  const [toast, setToast] = useState<{ visitId: string; name: string; remaining: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [just, setJust] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(TYPE_KEY);
      if (saved && types.some((t) => t.id === saved)) setType(saved);
    } catch { /* אחסון חסום */ }
  }, [types]);

  function pickType(id: string) {
    setType(id);
    try { localStorage.setItem(TYPE_KEY, id); } catch { /* אחסון חסום */ }
  }

  const shown = useMemo(() => {
    const s = q.trim();
    return s ? parents.filter((p) => `${p.parent_name} ${p.baby_name ?? ""} ${p.phone ?? ""}`.includes(s)) : parents;
  }, [q, parents]);

  function doPunch(p: ParentRow) {
    setErr(null);
    start(async () => {
      const r = await punch(p.id, type || null);
      if ("error" in r) { setErr(`${p.parent_name}: ${r.error}`); return; }
      setJust(p.id);
      setToast({ visitId: r.visitId, name: p.parent_name, remaining: r.remaining });
    });
  }

  function undo() {
    if (!toast) return;
    const id = toast.visitId;
    setToast(null);
    start(async () => { await voidVisit(id); setJust(null); });
  }

  const expire = useCallback(() => setToast(null), []);

  return (
    <div className="stack">
      <div className="search">
        <Icon name="search" />
        <input type="search" placeholder="חיפוש הורה, תינוק או טלפון" value={q} onChange={(e) => setQ(e.target.value)} aria-label="חיפוש" autoFocus />
      </div>
      {types.length > 0 && (
        <div className="chips" role="group" aria-label="סוג סדנה">
          {types.map((t) => (
            <button key={t.id} type="button" className="chip" aria-pressed={t.id === type} onClick={() => pickType(t.id)}>
              {t.id === type && <Icon name="check" size="sm" />}{t.name}
            </button>
          ))}
        </div>
      )}
      {err && <p className="msg err m0" role="alert">{err}</p>}
      <section className="card list-card">
        {shown.length === 0 ? (
          parents.length
            ? <EmptyState icon="search" text={`לא נמצאו הורים עבור "${q.trim()}"`} action={<button type="button" className="btn" onClick={() => setQ("")}>ניקוי חיפוש</button>} />
            : <EmptyState icon="users" text="עוד אין הורים פעילים" action={<Link href="/admin/parents" className="btn primary"><Icon name="plus" />הוספת הורה</Link>} />
        ) : (
          <ul className="list">
            {shown.map((p) => {
              const left = p.entries != null ? p.entries - p.used : null;
              return (
                <li key={p.id} className={just === p.id ? "is-just" : undefined}>
                  <Link href={`/admin/parents/${p.id}`} className="plain-link grow">
                    <div><span className="strong">{p.parent_name}</span>{p.baby_name ? <span className="muted"> · {p.baby_name}</span> : null}</div>
                    {p.entries != null && <PunchDots entries={p.entries} used={p.used} variant="mini" />}
                    <div className="row">
                      <span className={`faint${left !== null && left <= 1 ? " text-danger" : ""}`}>{left === null ? "אין כרטיסייה פתוחה" : `${left} נותרו`}</span>
                      {p.paid === false && <StatusBadge tone="warning">לא שולם</StatusBadge>}
                    </div>
                  </Link>
                  <button className="btn primary" disabled={pending || left === null || left <= 0} onClick={() => doPunch(p)} aria-label={`ניקוב ל${p.parent_name}`}>
                    <Icon name="check" />נקב
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      {toast && <UndoToast key={toast.visitId} text={`נוקב: ${toast.name} · ${toast.remaining} נותרו`} seconds={UNDO_SEC} onUndo={undo} onExpire={expire} />}
    </div>
  );
}
