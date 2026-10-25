"use client";

import { useRef } from "react";
import { Icon } from "./Icon";

/** יצירה/עריכה של ישות: גיליון תחתון (נייד) / לוח צף (דסקטופ). גוף נגלל, כפתורים קבועים למטה */
export function Sheet({ triggerLabel, title, children }: {
  triggerLabel: string; title: string; children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className="btn primary" onClick={() => ref.current?.showModal()}><Icon name="plus" />{triggerLabel}</button>
      <dialog ref={ref} className="sheet" dir="rtl" aria-label={title}
        onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}>
        <div className="sheet-head">
          <h2>{title}</h2>
          <SheetClose icon />
        </div>
        {children}
      </dialog>
    </>
  );
}

export function SheetClose({ icon = false }: { icon?: boolean }) {
  return icon
    ? <button type="button" className="btn ghost icon" aria-label="סגירה" onClick={(e) => e.currentTarget.closest("dialog")?.close()}><Icon name="x" /></button>
    : <button type="button" className="btn" onClick={(e) => e.currentTarget.closest("dialog")?.close()}>ביטול</button>;
}
