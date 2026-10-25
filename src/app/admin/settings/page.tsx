import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/guards";
import { fmtSession, upcomingSessions } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { ActionForm } from "@/components/ActionForm";
import { Toggle } from "@/components/Toggle";
import { addAdmin, addSession, addTemplate, addWorkshopType, deleteSession, saveBusiness, toggleTemplate, toggleWorkshopType } from "../actions";
import { ThemeFromLogo } from "./ThemeFromLogo";

export default async function Settings() {
  await requireAdmin();
  const [s, types, templates, sessions, admins] = await Promise.all([
    getSettings(),
    db().select().from(schema.workshopTypes).orderBy(desc(schema.workshopTypes.active), asc(schema.workshopTypes.name)),
    db().select().from(schema.cardTemplates).orderBy(desc(schema.cardTemplates.active), asc(schema.cardTemplates.entries)),
    upcomingSessions(30),
    db().select({ id: schema.users.id, name: schema.users.parentName, email: schema.users.email }).from(schema.users).where(eq(schema.users.role, "admin")),
  ]);
  const activeTypes = types.filter((t) => t.active);

  return (
    <main className="wrap stack">
      <section className="card stack">
        <h3>מיתוג</h3>
        <ThemeFromLogo initialLogo={s?.logoDataUrl ?? null} initialTheme={s?.theme ?? null} />
      </section>

      <section className="card stack">
        <h3>עסק ויצירת קשר</h3>
        <ActionForm action={saveBusiness} submit="שמירה" resetOnOk={false}>
          <label className="f">שם העסק<input name="businessName" defaultValue={s?.businessName ?? ""} required /></label>
          <div className="grid2">
            <label className="f">טלפון לביט<input name="bitPhone" type="tel" defaultValue={s?.bitPhone ?? ""} dir="ltr" /></label>
            <label className="f">וואטסאפ<input name="whatsappPhone" type="tel" defaultValue={s?.whatsappPhone ?? ""} dir="ltr" /></label>
          </div>
          <label className="f">טלפון לחיוג<input name="callPhone" type="tel" defaultValue={s?.callPhone ?? ""} dir="ltr" /></label>
          <label className="f">קישור לפתיחת ביט (לא חובה)<input name="bitUrl" type="url" placeholder="https://" defaultValue={s?.bitUrl ?? ""} dir="ltr" /></label>
        </ActionForm>
      </section>

      <section className="card stack">
        <h3>סוגי סדנאות</h3>
        <ul className="list">
          {types.map((t) => (
            <li key={t.id}><span style={{ opacity: t.active ? 1 : 0.5 }}>{t.name}</span><Toggle on={t.active} label={`פעיל: ${t.name}`} onChange={toggleWorkshopType.bind(null, t.id)} /></li>
          ))}
        </ul>
        <ActionForm action={addWorkshopType} submit="הוספה" className="row">
          <input name="name" placeholder="עיסוי תינוקות" required style={{ flex: 1, width: "auto" }} aria-label="שם סדנה" />
        </ActionForm>
      </section>

      <section className="card stack">
        <h3>תבניות כרטיסיות</h3>
        <ul className="list">
          {templates.map((t) => (
            <li key={t.id}><span style={{ opacity: t.active ? 1 : 0.5 }}>{t.name} · {t.entries} כניסות · {t.price} ₪</span><Toggle on={t.active} label={`פעילה: ${t.name}`} onChange={toggleTemplate.bind(null, t.id)} /></li>
          ))}
        </ul>
        <ActionForm action={addTemplate} submit="הוספה">
          <label className="f">שם<input name="name" placeholder="כרטיסיית 8" required /></label>
          <div className="grid2">
            <label className="f">כניסות<input name="entries" type="number" min={1} max={200} required /></label>
            <label className="f">מחיר (₪)<input name="price" type="number" min={0} required /></label>
          </div>
        </ActionForm>
      </section>

      <section className="card stack">
        <h3>מפגשים קרובים</h3>
        <ul className="list">
          {sessions.map((x) => (
            <li key={x.id}>
              <span>{x.workshop} · {fmtSession(x.starts_at)}{x.location ? <span className="faint"> · {x.location}</span> : null}</span>
              <form action={deleteSession.bind(null, x.id)}><button className="btn ghost danger">מחיקה</button></form>
            </li>
          ))}
        </ul>
        {activeTypes.length ? (
          <ActionForm action={addSession} submit="הוספת מפגש">
            <div className="grid2">
              <label className="f">סדנה
                <select name="workshopTypeId">{activeTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
              </label>
              <label className="f">מתי<input name="startsAt" type="datetime-local" required /></label>
            </div>
            <label className="f">מקום<input name="location" /></label>
          </ActionForm>
        ) : <p className="faint" style={{ margin: 0 }}>הוסיפו סוג סדנה כדי לתזמן מפגשים</p>}
      </section>

      <section className="card stack">
        <h3>מנהלים</h3>
        <ul className="list">{admins.map((a) => <li key={a.id}><span>{a.name}</span><span className="faint" dir="ltr">{a.email}</span></li>)}</ul>
        <details>
          <summary>הוספת מנהל</summary>
          <ActionForm action={addAdmin} submit="הוספה">
            <label className="f">שם<input name="parentName" required /></label>
            <label className="f">מייל<input name="email" type="email" required dir="ltr" /></label>
            <label className="f">סיסמה (10+ תווים)<input name="password" minLength={10} required dir="ltr" /></label>
          </ActionForm>
        </details>
      </section>
    </main>
  );
}
