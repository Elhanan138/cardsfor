"use client";

import { useCallback, useState, useTransition } from "react";
import { punch, voidVisit } from "@/app/admin/actions";
import { Icon } from "./Icon";
import { UndoToast } from "./UndoToast";

const TYPE_KEY = "punch-type";

/** ניקוב מתוך כרטיס ההורה — משתמש בסוג הסדנה האחרון שנבחר במסך הניקוב */
export function PunchNowButton({ userId, name, types, disabled }: { userId: string; name: string; types: { id: string; name: string }[]; disabled: boolean }) {
  const [toast, setToast] = useState<{ visitId: string; remaining: number; type: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function currentType() {
    let saved: string | null = null;
    try { saved = localStorage.getItem(TYPE_KEY); } catch { /* אחסון חסום */ }
    return types.find((t) => t.id === saved) ?? types[0] ?? null;
  }

  function go() {
    setErr(null);
    const t = currentType();
    start(async () => {
      const r = await punch(userId, t?.id ?? null);
      if ("error" in r) { setErr(r.error ?? "הניקוב נכשל"); return; }
      setToast({ visitId: r.visitId, remaining: r.remaining, type: t?.name ?? "סדנה" });
    });
  }

  const expire = useCallback(() => setToast(null), []);

  return (
    <>
      <button type="button" className="btn primary block" disabled={disabled || pending} onClick={go}><Icon name="check" />ניקוב עכשיו</button>
      {err && <span className="msg err" role="alert">{err}</span>}
      {toast && (
        <UndoToast key={toast.visitId} text={`נוקב: ${name} · ${toast.type} · ${toast.remaining} נותרו`} seconds={10} onExpire={expire}
          onUndo={() => { const id = toast.visitId; setToast(null); start(async () => { await voidVisit(id); }); }} />
      )}
    </>
  );
}
