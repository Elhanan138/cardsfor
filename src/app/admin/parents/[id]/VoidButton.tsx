"use client";

import { useTransition } from "react";
import { voidVisit } from "../../actions";

export function VoidButton({ visitId }: { visitId: string }) {
  const [pending, start] = useTransition();
  return (
    <button className="btn ghost danger" disabled={pending}
      onClick={() => { if (confirm("לבטל את הניקוב? הכניסה תחזור ליתרה.")) start(async () => { await voidVisit(visitId); }); }}>
      ביטול
    </button>
  );
}
