"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [err, run, pending] = useActionState(login, undefined);
  return (
    <form action={run} className="stack">
      <label className="f">מייל<input name="email" type="email" autoComplete="email" required dir="ltr" /></label>
      <label className="f">סיסמה<input name="password" type="password" autoComplete="current-password" required dir="ltr" /></label>
      {err && <span className="msg err" role="alert">{err}</span>}
      <button className="btn primary" disabled={pending}>{pending ? "נכנסים…" : "כניסה"}</button>
      <p className="faint" style={{ margin: 0, textAlign: "center" }}>שכחת סיסמה? פנו לסדנה ונאפס.</p>
    </form>
  );
}
