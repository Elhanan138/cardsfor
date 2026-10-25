import { requireParent } from "@/lib/guards";
import { cardsFor, fmtDate, fmtSession, upcomingSessions, visitsFor } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { Brand } from "@/components/Brand";
import { ContactBar } from "@/components/ContactBar";
import { EmptyState } from "@/components/EmptyState";
import { PunchDots } from "@/components/PunchDots";
import { SignOut } from "@/components/SignOut";
import { StatusBadge } from "@/components/StatusBadge";

export default async function Me() {
  const u = await requireParent();
  const [cards, visits, sessions, s] = await Promise.all([cardsFor(u.id), visitsFor(u.id, false, 20), upcomingSessions(), getSettings()]);
  const card = cards.find((c) => !c.closed_at) ?? cards[0];
  const left = card ? card.entries - card.used : 0;

  return (
    <>
      <header className="top">
        <Brand logo={s?.logoDataUrl} name={s?.businessName} />
        <SignOut />
      </header>
      <main className="wrap stack">
        {card ? (
          <section className="ticket" aria-label="הכרטיסייה שלי">
            <div className="muted">{u.parentName}{u.babyName ? ` ו${u.babyName}` : ""} · {card.name}</div>
            <div className="big">{left}</div>
            <div className="muted">{left === 1 ? "כניסה אחת נותרה" : `כניסות נותרו מתוך ${card.entries}`}</div>
            <PunchDots entries={card.entries} used={card.used} />
            {card.paid
              ? <StatusBadge tone="success">שולם</StatusBadge>
              : <StatusBadge tone="warning">ממתין לתשלום{card.price ? ` · ${card.price.toLocaleString("he-IL")} ₪` : ""}</StatusBadge>}
            {left === 0 && <p className="muted">הכרטיסייה נוצלה. דברו איתנו לכרטיסייה חדשה.</p>}
          </section>
        ) : (
          <section className="card"><EmptyState icon="ticket" text="עוד אין לך כרטיסייה פעילה. דברו איתנו ונפתח אחת." /></section>
        )}

        <ContactBar
          amount={card && !card.paid ? card.price : 0}
          highlightBit={!!card && !card.paid}
          bitPhone={s?.bitPhone ?? null}
          bitUrl={s?.bitUrl ?? null}
          whatsapp={s?.whatsappPhone ?? null}
          call={s?.callPhone ?? null}
        />

        <section className="card stack tight">
          <h3>מפגשים קרובים</h3>
          {sessions.length ? (
            <ul className="list">
              {sessions.map((x) => (
                <li key={x.id}><span>{x.workshop}{x.location ? <span className="faint"> · {x.location}</span> : null}</span><span className="muted ltr">{fmtSession(x.starts_at)}</span></li>
              ))}
            </ul>
          ) : <EmptyState icon="calendar" text="אין מפגשים מתוכננים כרגע" />}
        </section>

        <section className="card stack tight">
          <h3>הביקורים שלי</h3>
          {visits.length ? (
            <ul className="list">
              {visits.map((v) => <li key={v.id}><span>{v.workshop ?? "סדנה"}</span><span className="muted ltr">{fmtDate(v.visited_at)}</span></li>)}
            </ul>
          ) : <EmptyState icon="history" text="הביקור הראשון יופיע כאן" />}
        </section>
      </main>
    </>
  );
}
