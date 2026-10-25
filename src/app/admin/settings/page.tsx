import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/guards";
import { fmtSession, upcomingSessions } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { ActionForm } from "@/components/ActionForm";
import { EmptyState } from "@/components/EmptyState";
import { Field } from "@/components/Field";
import { Icon, type IconName } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { SessionTimeField } from "@/components/SessionTimeField";
import { Toggle } from "@/components/Toggle";
import { UndoRow } from "@/components/UndoRow";
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
  const activeTemplates = templates.filter((t) => t.active);
  const contacts = [s?.bitPhone || s?.bitUrl ? "ביט" : null, s?.whatsappPhone ? "וואטסאפ" : null, s?.callPhone ? "חיוג" : null].filter(Boolean);

  return (
    <main className="wrap stack">
      <PageHeader title="הגדרות" description="פתחו אזור כדי לערוך" />

      <Section title="מיתוג" icon="palette" summary={<>{s?.logoDataUrl ? "לוגו וצבעים מותאמים" : "העלו לוגו והצבעים יחולצו ממנו"}</>} open={false}>
        <ThemeFromLogo initialLogo={s?.logoDataUrl ?? null} initialTheme={s?.theme ?? null} />
      </Section>

      <Section title="עסק ויצירת קשר" icon="phone" summary={<>{contacts.length ? contacts.join(" · ") : "עוד לא הוגדרו אמצעי קשר"}</>} open={!contacts.length}>
        <ActionForm action={saveBusiness} submit="שמירה" resetOnOk={false}>
          <Field label="שם העסק" required><input name="businessName" defaultValue={s?.businessName ?? ""} required /></Field>
          <div className="grid2">
            <Field label="טלפון לביט"><input name="bitPhone" type="tel" defaultValue={s?.bitPhone ?? ""} dir="ltr" /></Field>
            <Field label="וואטסאפ"><input name="whatsappPhone" type="tel" defaultValue={s?.whatsappPhone ?? ""} dir="ltr" /></Field>
          </div>
          <Field label="טלפון לחיוג"><input name="callPhone" type="tel" defaultValue={s?.callPhone ?? ""} dir="ltr" /></Field>
          <Field label="קישור לפתיחת ביט" help="לא חובה. אם יש לכם קישור תשלום של ביט, הכפתור גם יפתח אותו">
            <input name="bitUrl" type="url" placeholder="https://" defaultValue={s?.bitUrl ?? ""} dir="ltr" />
          </Field>
        </ActionForm>
      </Section>

      <Section title="סוגי סדנאות" icon="tag" summary={<>{activeTypes.length ? `${activeTypes.length} פעילים` : "עוד אין סוגי סדנאות"}</>} open={types.length === 0}>
        {types.length === 0 ? <EmptyState icon="tag" text="הוסיפו את סוג הסדנה הראשון כדי לנקב ולתזמן מפגשים" /> : (
          <ul className="list">
            {types.map((t) => (
              <li key={t.id} className={t.active ? undefined : "is-off"}><span>{t.name}</span><Toggle on={t.active} label={`פעיל: ${t.name}`} onChange={toggleWorkshopType.bind(null, t.id)} /></li>
            ))}
          </ul>
        )}
        <ActionForm action={addWorkshopType} submit="הוספה" className="row nowrap">
          <input name="name" placeholder="עיסוי תינוקות" required className="grow" aria-label="שם סדנה" />
        </ActionForm>
      </Section>

      <Section title="תבניות כרטיסיות" icon="ticket" summary={<>{activeTemplates.length ? `${activeTemplates.map((t) => t.entries).join(" · ")} כניסות` : "עוד אין תבניות"}</>} open={templates.length === 0}>
        {templates.length === 0 ? <EmptyState icon="ticket" text="תבנית חוסכת הקלדה בכל פתיחת כרטיסייה" /> : (
          <ul className="list">
            {templates.map((t) => (
              <li key={t.id} className={t.active ? undefined : "is-off"}><span>{t.name} · {t.entries} כניסות · {t.price} ₪</span><Toggle on={t.active} label={`פעילה: ${t.name}`} onChange={toggleTemplate.bind(null, t.id)} /></li>
            ))}
          </ul>
        )}
        <details open={templates.length === 0}>
          <summary><Icon name="plus" />תבנית חדשה</summary>
          <ActionForm action={addTemplate} submit="הוספה">
            <Field label="שם" required><input name="name" placeholder="כרטיסיית 8" required /></Field>
            <div className="grid2">
              <Field label="כניסות" required><input name="entries" type="number" inputMode="numeric" min={1} max={200} required /></Field>
              <Field label="מחיר (₪)" required><input name="price" type="number" inputMode="numeric" min={0} required /></Field>
            </div>
          </ActionForm>
        </details>
      </Section>

      <Section title="מפגשים קרובים" icon="calendar" summary={<>{sessions[0] ? <>הבא: <span className="ltr">{fmtSession(sessions[0].starts_at)}</span></> : "אין מפגשים מתוכננים"}</>} open={false}>
        {sessions.length === 0 ? <EmptyState icon="calendar" text="אין מפגשים מתוכננים. ההורים יראו כאן את המפגשים שתוסיפו" /> : (
          <ul className="list">
            {sessions.map((x) => (
              <UndoRow key={x.id} action={deleteSession.bind(null, x.id)} button="מחיקה" toast={`המפגש ${x.workshop} נמחק`}>
                <span className="grow">{x.workshop} · <span className="ltr">{fmtSession(x.starts_at)}</span>{x.location ? <span className="faint"> · {x.location}</span> : null}</span>
              </UndoRow>
            ))}
          </ul>
        )}
        {activeTypes.length ? (
          <details open={sessions.length === 0}>
            <summary><Icon name="plus" />מפגש חדש</summary>
            <ActionForm action={addSession} submit="הוספת מפגש">
              <Field label="סדנה" required>
                <select name="workshopTypeId">{activeTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
              </Field>
              <SessionTimeField />
              <Field label="מקום"><input name="location" /></Field>
            </ActionForm>
          </details>
        ) : <p className="faint m0">הוסיפו סוג סדנה כדי לתזמן מפגשים</p>}
      </Section>

      <Section title="מנהלים" icon="shield" summary={<>{`${admins.length} מנהלים`}</>} open={false}>
        <ul className="list">{admins.map((a) => <li key={a.id}><span>{a.name}</span><span className="faint ltr">{a.email}</span></li>)}</ul>
        <details>
          <summary><Icon name="plus" />הוספת מנהל</summary>
          <ActionForm action={addAdmin} submit="הוספה">
            <Field label="שם" required><input name="parentName" required /></Field>
            <Field label="מייל" required><input name="email" type="email" required dir="ltr" /></Field>
            <Field label="סיסמה" required help="לפחות 10 תווים"><input name="password" minLength={10} required dir="ltr" /></Field>
          </ActionForm>
        </details>
      </Section>

      <p className="faint center m0"><Link href="/admin/styleguide">מדריך עיצוב</Link></p>
    </main>
  );
}

function Section({ title, icon, summary, open, children }: { title: string; icon: IconName; summary: React.ReactNode; open: boolean; children: React.ReactNode }) {
  return (
    <details className="card acc" open={open}>
      <summary>
        <span className="row nowrap grow">
          <span className="acc-ico"><Icon name={icon} /></span>
          <span className="grow acc-text">
            <span className="h3">{title}</span>
            <span className="faint">{summary}</span>
          </span>
        </span>
        <span className="chev"><Icon name="chevronLeft" /></span>
      </summary>
      <div className="stack">{children}</div>
    </details>
  );
}
