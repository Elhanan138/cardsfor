import { requireParent } from "@/lib/guards";
import { cardsFor, fmtDate, fmtSession, upcomingSessions, visitsFor } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { PunchDots } from "@/components/PunchDots";
import { ContactBar } from "@/components/ContactBar";
import { signOut } from "@/auth";

export default async function Me() {
  const u = await requireParent();
  const [cards, visits, sessions, s] = await Promise.all([cardsFor(u.id), visitsFor(u.id, false, 20), upcomingSessions(), getSettings()]);
  const card = cards.find((c) => !c.closed_at) ?? cards[0];
  const left = card ? card.entries - card.used : 0;

  return (
    <>
      <header className="top">
        {s?.logoDataUrl ? <img src={s.logoDataUrl} alt={s.businessName} /> : <h2>{s?.businessName}</h2>}
        <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
          <button className="btn ghost">יציאה</button>
        </form>
      </header>
      <main className="wrap stack">
        {card ? (
          <section className="ticket" aria-label="הכרטיסייה שלי">
            <div className="muted">{u.parentName}{u.babyName ? ` ו${u.babyName}` : ""} · {card.name}</div>
            <div className="big" style={{ marginTop: 10 }}>{left}</div>
            <div className="muted">{left === 1 ? "כניסה אחת נותרה" : `כניסות נותרו מתוך ${card.entries}`}</div>
            <PunchDots entries={card.entries} used={card.used} />
            {card.paid
              ? <span className="tag ok">שולם</span>
              : <span className="tag warn">ממתין לתשלום{card.price ? ` · ${card.price.toLocaleString("he-IL")} ₪` : ""}</span>}
            {left === 0 && <p className="muted" style={{ marginBottom: 0 }}>הכרטיסייה נוצלה. דברו איתנו לכרטיסייה חדשה.</p>}
          </section>
        ) : (
          <section className="card"><p style={{ margin: 0 }}>עוד אין לך כרטיסייה פעילה. דברו איתנו ונפתח אחת.</p></section>
        )}

        <ContactBar
          amount={card && !card.paid ? card.price : 0}
          highlightBit={!!card && !card.paid}
          bitPhone={s?.bitPhone ?? null}
          bitUrl={s?.bitUrl ?? null}
          whatsapp={s?.whatsappPhone ?? null}
          call={s?.callPhone ?? null}
        />

        <section className="card">
          <h3>מפגשים קרובים</h3>
          {sessions.length ? (
            <ul className="list" style={{ marginTop: 6 }}>
              {sessions.map((x) => (
                <li key={x.id}><span>{x.workshop}{x.location ? <span className="faint"> · {x.location}</span> : null}</span><span className="muted">{fmtSession(x.starts_at)}</span></li>
              ))}
            </ul>
          ) : <p className="faint" style={{ margin: "6px 0 0" }}>אין מפגשים מתוכננים כרגע</p>}
        </section>

        <section className="card">
          <h3>הביקורים שלי</h3>
          {visits.length ? (
            <ul className="list" style={{ marginTop: 6 }}>
              {visits.map((v) => <li key={v.id}><span>{v.workshop ?? "סדנה"}</span><span className="muted">{fmtDate(v.visited_at)}</span></li>)}
            </ul>
          ) : <p className="faint" style={{ margin: "6px 0 0" }}>הביקור הראשון יופיע כאן</p>}
        </section>
      </main>
    </>
  );
}
