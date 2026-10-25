"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { ParentRow } from "@/lib/data";
import { punch, voidVisit } from "./actions";

const UNDO_SEC = 10;

export function PunchList({ parents, types }: { parents: ParentRow[]; types: { id: string; name: string }[] }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState(types[0]?.id ?? "");
  const [toast, setToast] = useState<{ visitId: string; name: string; remaining: number; t: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [just, setJust] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const saved = localStorage.getItem("punch-type");
    if (saved && types.some((t) => t.id === saved)) setType(saved);
  }, [types]);

  useEffect(() => {
    if (!toast) return;
    if (toast.t <= 0) { setToast(null); return; }
    const id = setTimeout(() => setToast((x) => (x ? { ...x, t: x.t - 1 } : x)), 1000);
    return () => clearTimeout(id);
  }, [toast]);

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
      setToast({ visitId: r.visitId, name: p.parent_name, remaining: r.remaining, t: UNDO_SEC });
    });
  }

  function undo() {
    if (!toast) return;
    const id = toast.visitId;
    setToast(null);
    start(async () => { await voidVisit(id); setJust(null); });
  }

  return (
    <div className="stack">
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <input type="search" placeholder="חיפוש הורה, תינוק או טלפון" value={q} onChange={(e) => setQ(e.target.value)} aria-label="חיפוש" autoFocus />
        {types.length > 0 && (
          <select value={type} onChange={(e) => { setType(e.target.value); localStorage.setItem("punch-type", e.target.value); }} aria-label="סוג סדנה" style={{ width: "auto", maxWidth: 160 }}>
            {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
      </div>
      {err && <p className="msg err" role="alert" style={{ margin: 0 }}>{err}</p>}
      <section className="card" style={{ padding: "4px 16px" }}>
        {shown.length === 0 ? (
          <p className="faint">{parents.length ? "אין תוצאות" : <>עוד אין הורים. <Link href="/admin/parents">הוספת הורה</Link></>}</p>
        ) : (
          <ul className="list">
            {shown.map((p) => {
              const left = p.entries != null ? p.entries - p.used : null;
              return (
                <li key={p.id} className={just === p.id ? "just" : ""}>
                  <Link href={`/admin/parents/${p.id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
                    <div><b style={{ fontWeight: 600 }}>{p.parent_name}</b>{p.baby_name ? <span className="muted"> · {p.baby_name}</span> : null}</div>
                    <div className="faint" style={{ color: left === null ? undefined : left <= 1 ? "var(--danger)" : undefined }}>
                      {left === null ? "אין כרטיסייה פתוחה" : `${left} נותרו`}{p.paid === false ? " · לא שולם" : ""}
                    </div>
                  </Link>
                  <button className="btn primary" disabled={pending || left === null || left <= 0} onClick={() => doPunch(p)}>נקב</button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      {toast && (
        <div className="toast" role="status">
          <span>נוקב: {toast.name} · {toast.remaining} נותרו</span>
          <button onClick={undo}>בטל ({toast.t})</button>
        </div>
      )}
    </div>
  );
}
