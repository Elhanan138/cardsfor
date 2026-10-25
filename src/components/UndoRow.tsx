"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";

const UNDO_SEC = 5;

/** מחיקה/ביטול קלים: עדכון אופטימי מיידי + טוסט "ביטול" ל-5 שניות, ורק אז הפעולה בשרת */
export function UndoRow({ action, button, toast, mode = "remove", className, children }: {
  action: () => Promise<unknown>;
  button: string;
  toast: string;
  mode?: "remove" | "strike";
  className?: string;
  children: React.ReactNode;
}) {
  const [left, setLeft] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    if (left === null) return;
    if (left <= 0) {
      if (!fired.current) {
        fired.current = true;
        action().catch(() => { fired.current = false; setLeft(null); setErr("הפעולה נכשלה, נסו שוב"); });
      }
      return;
    }
    const id = setTimeout(() => setLeft((x) => (x === null ? x : x - 1)), 1000);
    return () => clearTimeout(id);
  }, [left, action]);

  const pending = left !== null;
  const cls = [className, pending ? (mode === "remove" ? "is-removed" : "is-pending") : ""].filter(Boolean).join(" ");
  return (
    <>
      <li className={cls || undefined}>
        {children}
        {err && <span className="msg err" role="alert">{err}</span>}
        {!pending && (
          <button type="button" className="btn ghost danger" onClick={() => { setErr(null); setLeft(UNDO_SEC); }}>{button}</button>
        )}
      </li>
      {pending && left > 0 && createPortal(
        <div className="toast" role="status">
          <span>{toast}</span>
          <button type="button" onClick={() => setLeft(null)}><Icon name="undo" size="sm" />ביטול ({left})</button>
        </div>,
        document.body,
      )}
    </>
  );
}
