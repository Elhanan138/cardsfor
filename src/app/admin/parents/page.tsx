import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/guards";
import { parentsWithBalance } from "@/lib/data";
import { ActionForm } from "@/components/ActionForm";
import { createParent } from "../actions";

export default async function Parents() {
  await requireAdmin();
  const [parents, templates] = await Promise.all([
    parentsWithBalance(true),
    db().select().from(schema.cardTemplates).where(eq(schema.cardTemplates.active, true)).orderBy(asc(schema.cardTemplates.entries)),
  ]);
  return (
    <main className="wrap stack">
      <section className="card">
        <details>
          <summary>הוספת הורה</summary>
          <ActionForm action={createParent} submit="הוספה">
            <div className="grid2">
              <label className="f">שם ההורה<input name="parentName" required /></label>
              <label className="f">שם התינוק<input name="babyName" /></label>
            </div>
            <div className="grid2">
              <label className="f">מייל<input name="email" type="email" required dir="ltr" /></label>
              <label className="f">טלפון<input name="phone" type="tel" dir="ltr" /></label>
            </div>
            <div className="grid2">
              <label className="f">סיסמה זמנית<input name="password" minLength={8} required dir="ltr" /></label>
              <label className="f">כרטיסייה ראשונה
                <select name="templateId" defaultValue="">
                  <option value="">בלי</option>
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.entries} כניסות</option>)}
                </select>
              </label>
            </div>
          </ActionForm>
        </details>
      </section>
      <section className="card" style={{ padding: "4px 16px" }}>
        {parents.length === 0 ? <p className="faint">ההורה הראשון יופיע כאן</p> : (
          <ul className="list">
            {parents.map((p) => {
              const left = p.entries != null ? p.entries - p.used : null;
              return (
                <li key={p.id}>
                  <Link href={`/admin/parents/${p.id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
                    <b style={{ fontWeight: 600 }}>{p.parent_name}</b>{p.baby_name ? <span className="muted"> · {p.baby_name}</span> : null}
                    <div className="faint">{p.email}</div>
                  </Link>
                  {left === null ? <span className="tag soft">ללא כרטיסייה</span>
                    : <span className={`tag ${p.paid ? "ok" : "warn"}`}>{left} נותרו{p.paid ? "" : " · לא שולם"}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
