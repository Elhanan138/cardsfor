import { getSettings } from "@/lib/settings";
import { LoginForm } from "./LoginForm";

export default async function Login() {
  const s = await getSettings();
  return (
    <main className="wrap" style={{ paddingTop: "12vh" }}>
      <div className="card stack" style={{ padding: 24 }}>
        {s?.logoDataUrl
          ? <img src={s.logoDataUrl} alt={s.businessName} style={{ height: 64, width: "auto", margin: "0 auto" }} />
          : <h1 style={{ textAlign: "center" }}>{s?.businessName ?? "כרטיסיות"}</h1>}
        <p className="muted" style={{ textAlign: "center", margin: 0 }}>כניסה לכרטיסייה שלך</p>
        <LoginForm />
      </div>
    </main>
  );
}
