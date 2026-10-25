"use client";

import { useRef, useTransition } from "react";

/** פעולה כבדה (השבתה וכד׳): חלון אישור, כפתורים בצד שמאל */
export function ConfirmButton({ label, title, body, confirm, action, danger = true }: {
  label: string; title: string; body: string; confirm: string; action: () => Promise<unknown>; danger?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, start] = useTransition();
  return (
    <>
      <button type="button" className={`btn${danger ? " danger" : ""}`} onClick={() => ref.current?.showModal()}>{label}</button>
      <dialog ref={ref} className="confirm" dir="rtl" aria-labelledby="confirm-title"
        onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}>
        <h3 id="confirm-title">{title}</h3>
        <p>{body}</p>
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={() => ref.current?.close()} disabled={pending}>חזרה</button>
          <button type="button" className={`btn ${danger ? "solid-danger" : "primary"}`} disabled={pending}
            onClick={() => start(async () => { await action(); ref.current?.close(); })}>
            {pending ? "רגע…" : confirm}
          </button>
        </div>
      </dialog>
    </>
  );
}
