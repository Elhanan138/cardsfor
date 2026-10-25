"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";

/** טוסט עם ספירה לאחור וכפתור "ביטול"; onExpire נקרא כשהזמן נגמר */
export function UndoToast({ text, seconds, onUndo, onExpire }: { text: string; seconds: number; onUndo: () => void; onExpire: () => void }) {
  const [t, setT] = useState(seconds);
  useEffect(() => {
    if (t <= 0) { onExpire(); return; }
    const id = setTimeout(() => setT((x) => x - 1), 1000);
    return () => clearTimeout(id);
  }, [t, onExpire]);
  return createPortal(
    <div className="toast" role="status">
      <span>{text}</span>
      <button type="button" onClick={onUndo}><Icon name="undo" size="sm" />ביטול ({t})</button>
    </div>,
    document.body,
  );
}
