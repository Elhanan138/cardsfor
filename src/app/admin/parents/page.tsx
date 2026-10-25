import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/guards";
import { parentsWithBalance } from "@/lib/data";
import { ActionForm } from "@/components/ActionForm";
import { EmptyState } from "@/components/EmptyState";
import { Field } from "@/components/Field";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { createParent } from "../actions";

export default async function Parents() {
  await requireAdmin();
  const [parents, templates] = await Promise.all([
    parentsWithBalance(true),
    db().select().from(schema.cardTemplates).where(eq(schema.cardTemplates.active, true)).orderBy(asc(schema.cardTemplates.entries)),
  ]);
  return (
    <main className="wrap stack">
      <PageHeader title="הורים" description={parents.length ? `${parents.length} הורים במערכת` : undefined} />
      <section className="card">
        <details open={parents.length === 0}>
          <summary><Icon name="plus" />הוספת הורה</summary>
          <ActionForm action={createParent} submit="הוספה">
            <div className="grid2">
              <Field label="שם ההורה" required><input name="parentName" required /></Field>
              <Field label="שם התינוק"><input name="babyName" /></Field>
            </div>
            <div className="grid2">
              <Field label="מייל" required><input name="email" type="email" required dir="ltr" /></Field>
              <Field label="טלפון"><input name="phone" type="tel" dir="ltr" /></Field>
            </div>
            <div className="grid2">
              <Field label="סיסמה זמנית" required help="לפחות 8 תווים. שלחו להורה אחרי השמירה"><input name="password" minLength={8} required dir="ltr" /></Field>
              <Field label="כרטיסייה ראשונה">
                <select name="templateId" defaultValue="">
                  <option value="">בלי</option>
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.entries} כניסות</option>)}
                </select>
              </Field>
            </div>
          </ActionForm>
        </details>
      </section>
      <section className="card list-card">
        {parents.length === 0 ? <EmptyState icon="users" text="ההורה הראשון יופיע כאן. מלאו את הטופס למעלה" /> : (
          <ul className="list">
            {parents.map((p) => {
              const left = p.entries != null ? p.entries - p.used : null;
              return (
                <li key={p.id}>
                  <Link href={`/admin/parents/${p.id}`} className="plain-link grow">
                    <div><span className="strong">{p.parent_name}</span>{p.baby_name ? <span className="muted"> · {p.baby_name}</span> : null}</div>
                    <div className="faint ltr">{p.email}</div>
                  </Link>
                  {left === null ? <StatusBadge>ללא כרטיסייה</StatusBadge>
                    : <StatusBadge tone={p.paid ? "success" : "warning"}>{left} נותרו{p.paid ? "" : " · לא שולם"}</StatusBadge>}
                  <Icon name="chevronLeft" size="sm" />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
