"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

type State = { error?: string; ok?: string } | undefined;

export function ActionForm({
  action, children, submit, className, resetOnOk = true,
}: {
  action: (s: State, fd: FormData) => Promise<State>;
  children: React.ReactNode;
  submit: string;
  className?: string;
  resetOnOk?: boolean;
}) {
  const [state, run] = useActionState(action, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok && resetOnOk) ref.current?.reset(); }, [state, resetOnOk]);
  return (
    <form ref={ref} action={run} className={className ?? "stack"}>
      {children}
      <div className="row">
        <Submit label={submit} />
        {state?.error && <span className="msg err" role="alert">{state.error}</span>}
        {state?.ok && <span className="msg ok" role="status">{state.ok}</span>}
      </div>
    </form>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button className="btn primary" disabled={pending}>{pending ? "רגע…" : label}</button>;
}
