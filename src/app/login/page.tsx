import { getSettings } from "@/lib/settings";
import { LoginForm } from "./LoginForm";

export default async function Login() {
  const s = await getSettings();
  return (
    <main className="wrap narrow-top">
      <div className="card pad-lg stack">
        {s?.logoDataUrl
          ? <img src={s.logoDataUrl} alt={s.businessName} className="login-logo" />
          : <h1 className="center">{s?.businessName ?? "כרטיסיות"}</h1>}
        <p className="muted center m0">כניסה לכרטיסייה שלך</p>
        <LoginForm />
      </div>
    </main>
  );
}
