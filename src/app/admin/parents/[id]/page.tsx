import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/guards";
import { cardsFor, fmtDate, visitsFor } from "@/lib/data";
import { ActionForm } from "@/components/ActionForm";
import { Toggle } from "@/components/Toggle";
import { PunchDots } from "@/components/PunchDots";
import { createCard, resetPassword, setActive, setPaid, updateParent } from "../../actions";
import { VoidButton } from "./VoidButton";

export default async function ParentSheet({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [u] = await db().select().from(schema.users).where(and(eq(schema.users.id, id), eq(schema.users.role, "parent"))).limit(1);
  if (!u) notFound();
  const [cards, visits, templates] = await Promise.all([
    cardsFor(id), visitsFor(id, true, 50),
    db().select().from(schema.cardTemplates).where(eq(schema.cardTemplates.active, true)).orderBy(asc(schema.cardTemplates.entries)),
  ]);
  const hasOpen = cards.some((c) => !c.closed_at);

  return (
    <main className="wrap stack">
      <section className="card">
        <div className="between">
          <div>
            <h2>{u.parentName}{u.babyName ? <span className="muted"> · {u.babyName}</span> : null}</h2>
            <div className="faint" dir="ltr" style={{ textAlign: "right" }}>{u.email}{u.phone ? ` · ${u.phone}` : ""}</div>
          </div>
          <Link href="/admin/parents" className="btn ghost" aria-label="סגירה">✕</Link>
        </div>
        {!u.active && <p className="tag warn" style={{ display: "inline-block" }}>מושבת</p>}
      </section>

      <section className="card stack">
        <h3>כרטיסיות</h3>
        {cards.length === 0 && <p className="faint" style={{ margin: 0 }}>אין כרטיסיות</p>}
        {cards.map((c) => (
          <div key={c.id} className="stack" style={{ gap: 6, opacity: c.closed_at ? 0.6 : 1 }}>
            <div className="between">
              <span>{c.name} · {c.entries - c.used} נותרו מתוך {c.entries}{c.closed_at ? " · נסגרה" : ""}</span>
              <span className="row" style={{ gap: 8 }}>
                <span className="faint">שולם</span>
                <Toggle on={c.paid} label={`שולם עבור ${c.name}`} onChange={setPaid.bind(null, c.id)} />
              </span>
            </div>
            {!c.closed_at && <PunchDots entries={c.entries} used={c.used} />}
          </div>
        ))}
        <details open={!hasOpen}>
          <summary>כרטיסייה חדשה</summary>
          <ActionForm action={createCard.bind(null, id)} submit="פתיחה">
            <label className="f">תבנית
              <select name="templateId" defaultValue={templates[0]?.id ?? "custom"}>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.entries} כניסות · {t.price} ₪</option>)}
                <option value="custom">מותאמת אישית (מלאו למטה)</option>
              </select>
            </label>
            <div className="grid2">
              <label className="f">שם<input name="name" placeholder="כרטיסיית 8" /></label>
              <label className="f">כניסות<input name="entries" type="number" min={1} max={200} /></label>
            </div>
            <label className="f">מחיר (₪)<input name="price" type="number" min={0} defaultValue={0} /></label>
          </ActionForm>
        </details>
      </section>

      <section className="card">
        <h3>ביקורים</h3>
        {visits.length === 0 ? <p className="faint" style={{ margin: "6px 0 0" }}>אין ביקורים</p> : (
          <ul className="list" style={{ marginTop: 6 }}>
            {visits.map((v) => (
              <li key={v.id} style={{ opacity: v.voided_at ? 0.5 : 1 }}>
                <span style={{ textDecoration: v.voided_at ? "line-through" : undefined }}>{v.workshop ?? "סדנה"} · {fmtDate(v.visited_at)}</span>
                {v.voided_at ? <span className="faint">בוטל</span> : <VoidButton visitId={v.id} />}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card stack">
        <h3>פרטים</h3>
        <ActionForm action={updateParent.bind(null, id)} submit="שמירה" resetOnOk={false}>
          <div className="grid2">
            <label className="f">שם ההורה<input name="parentName" defaultValue={u.parentName} required /></label>
            <label className="f">שם התינוק<input name="babyName" defaultValue={u.babyName ?? ""} /></label>
          </div>
          <label className="f">טלפון<input name="phone" type="tel" defaultValue={u.phone ?? ""} dir="ltr" /></label>
        </ActionForm>
        <details>
          <summary>איפוס סיסמה</summary>
          <ActionForm action={resetPassword.bind(null, id)} submit="עדכון סיסמה">
            <label className="f">סיסמה חדשה<input name="password" minLength={8} required dir="ltr" /></label>
          </ActionForm>
        </details>
        <form action={setActive.bind(null, id, !u.active)}>
          <button className={`btn ${u.active ? "danger" : ""}`}>{u.active ? "השבתת משתמש" : "הפעלה מחדש"}</button>
        </form>
      </section>
    </main>
  );
}
