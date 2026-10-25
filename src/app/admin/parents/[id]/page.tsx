import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/guards";
import { cardsFor, fmtDate, visitsFor } from "@/lib/data";
import { ActionForm } from "@/components/ActionForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { EmptyState } from "@/components/EmptyState";
import { Field } from "@/components/Field";
import { Icon } from "@/components/Icon";
import { PunchDots } from "@/components/PunchDots";
import { PunchNowButton } from "@/components/PunchNowButton";
import { telHref, waHref } from "@/lib/phone";
import { StatusBadge } from "@/components/StatusBadge";
import { Toggle } from "@/components/Toggle";
import { UndoRow } from "@/components/UndoRow";
import { createCard, resetPassword, setActive, setPaid, updateParent, voidVisit } from "../../actions";

export default async function ParentSheet({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [u] = await db().select().from(schema.users).where(and(eq(schema.users.id, id), eq(schema.users.role, "parent"))).limit(1);
  if (!u) notFound();
  const [cards, visits, templates, types] = await Promise.all([
    cardsFor(id), visitsFor(id, true, 50),
    db().select().from(schema.cardTemplates).where(eq(schema.cardTemplates.active, true)).orderBy(asc(schema.cardTemplates.entries)),
    db().select({ id: schema.workshopTypes.id, name: schema.workshopTypes.name }).from(schema.workshopTypes).where(eq(schema.workshopTypes.active, true)).orderBy(asc(schema.workshopTypes.name)),
  ]);
  const hasOpen = cards.some((c) => !c.closed_at);

  return (
    <main className="wrap stack">
      <section className="card stack tight">
        <div className="page-header">
          <div className="grow">
            <h1>{u.parentName}{u.babyName ? <span className="muted"> · {u.babyName}</span> : null}</h1>
            <div className="faint ltr">{u.phone ? `${u.phone} · ` : ""}{u.email}</div>
          </div>
          <Link href="/admin/parents" className="btn ghost icon" aria-label="חזרה לרשימת ההורים"><Icon name="x" /></Link>
        </div>
        {u.phone && (
          <div className="row">
            <a className="btn" href={waHref(u.phone)} target="_blank" rel="noopener noreferrer"><Icon name="message" />וואטסאפ</a>
            <a className="btn" href={telHref(u.phone)}><Icon name="phone" />חיוג</a>
          </div>
        )}
        {!u.active && <div><StatusBadge tone="danger">מושבת</StatusBadge></div>}
      </section>

      <section className="card stack">
        <h3>כרטיסיות</h3>
        {cards.length === 0 && <EmptyState icon="ticket" text="עוד אין כרטיסיות. פתחו אחת למטה" />}
        {cards.map((c) => (
          <div key={c.id} className={`stack tight${c.closed_at ? " muted" : ""}`}>
            <div className="between">
              <div className="row">
                <span className="strong">{c.name}</span>
                <span className="faint">{c.entries - c.used} נותרו מתוך {c.entries}</span>
                {c.closed_at && <StatusBadge>נסגרה</StatusBadge>}
              </div>
              <span className="row nowrap">
                <span className="faint">שולם</span>
                <Toggle on={c.paid} label={`שולם עבור ${c.name}`} onChange={setPaid.bind(null, c.id)} />
              </span>
            </div>
            {!c.closed_at && <PunchDots entries={c.entries} used={c.used} />}
            {!c.closed_at && u.active && <PunchNowButton userId={id} name={u.parentName} types={types} disabled={c.used >= c.entries} />}
          </div>
        ))}
        <details open={!hasOpen}>
          <summary><Icon name="plus" />כרטיסייה חדשה</summary>
          <ActionForm action={createCard.bind(null, id)} submit="פתיחה">
            <Field label="תבנית">
              <select name="templateId" defaultValue={templates[0]?.id ?? "custom"}>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.entries} כניסות · {t.price} ₪</option>)}
                <option value="custom">מותאמת אישית (מלאו למטה)</option>
              </select>
            </Field>
            <div className="grid2">
              <Field label="שם"><input name="name" placeholder="כרטיסיית 8" /></Field>
              <Field label="כניסות"><input name="entries" type="number" inputMode="numeric" min={1} max={200} /></Field>
            </div>
            <Field label="מחיר (₪)"><input name="price" type="number" inputMode="numeric" min={0} defaultValue={0} /></Field>
          </ActionForm>
        </details>
      </section>

      <section className="card stack tight">
        <h3>ביקורים</h3>
        {visits.length === 0 ? <EmptyState icon="history" text="אין ביקורים עדיין" /> : (
          <ul className="list">
            {visits.map((v) => {
              const label = <span>{v.workshop ?? "סדנה"} · <span className="ltr">{fmtDate(v.visited_at)}</span></span>;
              return v.voided_at
                ? <li key={v.id} className="is-voided">{label}<StatusBadge>בוטל</StatusBadge></li>
                : <UndoRow key={v.id} mode="strike" action={voidVisit.bind(null, v.id)} button="ביטול" toast="הניקוב יבוטל והכניסה תחזור ליתרה">{label}</UndoRow>;
            })}
          </ul>
        )}
      </section>

      <section className="card stack">
        <h3>פרטים</h3>
        <ActionForm action={updateParent.bind(null, id)} submit="שמירה" resetOnOk={false}>
          <div className="grid2">
            <Field label="שם ההורה" required><input name="parentName" defaultValue={u.parentName} required /></Field>
            <Field label="שם התינוק"><input name="babyName" defaultValue={u.babyName ?? ""} /></Field>
          </div>
          <Field label="טלפון"><input name="phone" type="tel" defaultValue={u.phone ?? ""} dir="ltr" /></Field>
        </ActionForm>
        <details>
          <summary>איפוס סיסמה</summary>
          <ActionForm action={resetPassword.bind(null, id)} submit="עדכון סיסמה">
            <Field label="סיסמה חדשה" required help="לפחות 8 תווים"><input name="password" minLength={8} required dir="ltr" /></Field>
          </ActionForm>
        </details>
        <div>
          {u.active
            ? <ConfirmButton label="השבתת משתמש" title={`להשבית את ${u.parentName}?`} body="ההורה לא יוכל להתחבר ולא יופיע ברשימת הניקוב. אפשר להפעיל מחדש בכל רגע."
                confirm="השבתה" action={setActive.bind(null, id, false)} />
            : <form action={setActive.bind(null, id, true)}><button className="btn">הפעלה מחדש</button></form>}
        </div>
      </section>
    </main>
  );
}
