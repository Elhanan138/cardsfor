import { requireAdmin } from "@/lib/guards";
import { EmptyState } from "@/components/EmptyState";
import { Field } from "@/components/Field";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { PunchDots } from "@/components/PunchDots";
import { CardSkeleton, ListSkeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";

const tokens = ["--primary", "--primary-soft", "--primary-text", "--accent", "--ink", "--muted", "--faint", "--line", "--canvas",
  "--ok", "--ok-bg", "--warn", "--warn-bg", "--info", "--info-bg", "--danger", "--danger-bg"];

/** תיעוד חי של מערכת העיצוב — כל דפוס חדש נוסף כאן באותה משימה */
export default async function StyleGuide() {
  await requireAdmin();
  return (
    <main className="wrap stack">
      <PageHeader title="מדריך עיצוב" description="הרכיבים והטוקנים של המערכת. לפני דפוס חדש — בדקו כאן." />

      <section className="card stack">
        <h3>טיפוגרפיה</h3>
        <h1>כותרת עמוד · h1</h1><h2>כותרת · h2</h2><h3>כותרת כרטיס · h3</h3>
        <p className="m0">טקסט גוף</p><p className="muted m0">טקסט משני (.muted)</p><p className="faint m0">כיתוב (.faint)</p>
      </section>

      <section className="card stack">
        <h3>צבעים (טוקנים בלבד)</h3>
        <div className="grid2">
          {tokens.map((t) => <div key={t} className="stack tight"><div className="sg-swatch" style={{ background: `var(${t})` }} /><span className="faint ltr">{t}</span></div>)}
        </div>
      </section>

      <section className="card stack">
        <h3>כפתורים</h3>
        <div className="row">
          <button className="btn primary"><Icon name="plus" />ראשי</button>
          <button className="btn">משני</button>
          <button className="btn ghost">שקט</button>
          <button className="btn danger">מחיקה</button>
          <button className="btn solid-danger">אישור מחיקה</button>
          <button className="btn ghost icon" aria-label="סגירה"><Icon name="x" /></button>
        </div>
        <p className="faint m0">ראשי — אחד לכל אזור. אייקון 16px בכפתור, 14px בטוסט/תגית, רווח gap בלבד.</p>
      </section>

      <section className="card stack">
        <h3>StatusBadge</h3>
        <div className="row">
          <StatusBadge>ללא כרטיסייה</StatusBadge><StatusBadge tone="success">שולם</StatusBadge>
          <StatusBadge tone="warning">לא שולם</StatusBadge><StatusBadge tone="info">מידע</StatusBadge><StatusBadge tone="danger">מושבת</StatusBadge>
        </div>
      </section>

      <section className="card stack">
        <h3>Field</h3>
        <Field label="שדה חובה" required help="טקסט עזרה"><input /></Field>
        <Field label="שדה רשות"><input /></Field>
      </section>

      <section className="card stack">
        <h3>כרטיסייה מנוקבת</h3>
        <PunchDots entries={8} used={3} />
        <PunchDots entries={8} used={3} variant="mini" />
        <p className="faint m0">מלאה בכרטיס, mini בשורות רשימה.</p>
      </section>

      <section className="card stack">
        <h3>צ׳יפים (בחירה / סינון / ניווט)</h3>
        <div className="chips">
          <button className="chip" aria-pressed="true"><Icon name="check" size="sm" />עיסוי תינוקות</button>
          <button className="chip" aria-pressed="false">התפתחות</button>
          <button className="chip" aria-pressed="false">לא שולם <span className="count">· 3</span></button>
        </div>
        <p className="faint m0">aria-pressed לבחירה וסינון, aria-current בניווט. גובה 40px, גלילה אופקית.</p>
      </section>

      <section className="card stack">
        <h3>חיפוש</h3>
        <div className="search"><Icon name="search" /><input type="search" placeholder="חיפוש" /></div>
      </section>

      <details className="card acc">
        <summary>
          <span className="row nowrap grow"><span className="acc-ico"><Icon name="tag" /></span>
            <span className="grow acc-text"><span className="h3">אקורדיון הגדרות</span><span className="faint">תקציר חי של התוכן</span></span></span>
          <span className="chev"><Icon name="chevronLeft" /></span>
        </summary>
        <p className="m0">אזור סגור מציג תקציר; נפתח אוטומטית כשהאזור ריק.</p>
      </details>

      <section className="card">
        <h3>EmptyState</h3>
        <EmptyState icon="users" text="עוד אין פריטים" action={<button className="btn primary"><Icon name="plus" />הוספה</button>} />
      </section>

      <section className="card stack">
        <h3>Skeleton</h3>
        <ListSkeleton rows={2} action />
      </section>
      <CardSkeleton />

      <section className="card stack">
        <h3>חוקי שכבות</h3>
        <ul className="m0">
          <li>יצירת ישות (הורה): Sheet — גיליון תחתון בנייד, לוח צף בדסקטופ, גוף נגלל וכפתורים קבועים משמאל.</li>
          <li>אחרי ניקוב: UndoToast — 10 שניות לביטול, השורה מודגשת.</li>
          <li>מחיקה/ביטול קל (ניקוב, מפגש): UndoRow — עדכון מיידי + טוסט ״ביטול״ 5 שניות.</li>
          <li>פעולה כבדה (השבתת משתמש): ConfirmButton — חלון אישור, כפתורים משמאל.</li>
          <li>תאריכים: lib/formatDate בלבד, dd/MM/yyyy. בחירת מועד: SessionTimeField (בלי input type=date).</li>
          <li>טעינה: loading.tsx עם Skeleton בצורת התוכן — אף פעם לא ספינר עמוד.</li>
        </ul>
      </section>
    </main>
  );
}
