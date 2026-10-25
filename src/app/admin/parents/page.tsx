import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/guards";
import { parentsWithBalance } from "@/lib/data";
import { ActionForm } from "@/components/ActionForm";
import { Field } from "@/components/Field";
import { PageHeader } from "@/components/PageHeader";
import { Sheet, SheetClose } from "@/components/Sheet";
import { createParent } from "../actions";
import { ParentsList } from "./ParentsList";

export default async function Parents() {
  await requireAdmin();
  const [parents, templates] = await Promise.all([
    parentsWithBalance(true),
    db().select().from(schema.cardTemplates).where(eq(schema.cardTemplates.active, true)).orderBy(asc(schema.cardTemplates.entries)),
  ]);
  return (
    <main className="wrap stack">
      <PageHeader
        title="הורים"
        description={parents.length ? `${parents.length} הורים במערכת` : undefined}
        actions={
          <Sheet triggerLabel="הורה" title="הורה חדש">
            <ActionForm action={createParent} submit="הוספה" className="stack sheet-form" secondary={<SheetClose />}>
              <Field label="שם ההורה" required><input name="parentName" required /></Field>
              <Field label="שם התינוק"><input name="babyName" /></Field>
              <Field label="מייל" required><input name="email" type="email" inputMode="email" required dir="ltr" /></Field>
              <Field label="טלפון"><input name="phone" type="tel" dir="ltr" /></Field>
              <Field label="סיסמה זמנית" required help="לפחות 8 תווים. שלחו להורה אחרי השמירה"><input name="password" minLength={8} required dir="ltr" /></Field>
              <Field label="כרטיסייה ראשונה">
                <select name="templateId" defaultValue={templates[0]?.id ?? ""}>
                  <option value="">בלי</option>
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.entries} כניסות</option>)}
                </select>
              </Field>
            </ActionForm>
          </Sheet>
        }
      />
      <ParentsList parents={parents} />
    </main>
  );
}
