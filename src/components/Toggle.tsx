"use client";

import { useOptimistic, useTransition } from "react";

export function Toggle({ on, label, onChange }: { on: boolean; label: string; onChange: (v: boolean) => Promise<void> }) {
  const [val, setVal] = useOptimistic(on);
  const [, start] = useTransition();
  return (
    <button
      type="button" role="switch" aria-checked={val} aria-label={label}
      className={`switch ${val ? "on" : ""}`}
      onClick={() => start(async () => { setVal(!val); await onChange(!val); })}
    ><span /></button>
  );
}
