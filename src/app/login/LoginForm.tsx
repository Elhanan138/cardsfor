"use client";

import { useActionState } from "react";
import { Field } from "@/components/Field";
import { login } from "./actions";

export function LoginForm() {
  const [err, run, pending] = useActionState(login, undefined);
  return (
    <form action={run} className="stack">
      <Field label="מייל"><input name="email" type="email" autoComplete="email" inputMode="email" required dir="ltr" /></Field>
      <Field label="סיסמה"><input name="password" type="password" autoComplete="current-password" required dir="ltr" /></Field>
      {err && <span className="msg err" role="alert">{err}</span>}
      <button className="btn primary block" disabled={pending}>{pending ? "נכנסים…" : "כניסה"}</button>
      <p className="faint center m0">שכחת סיסמה? פנו לסדנה ונאפס.</p>
    </form>
  );
}
