// תאריכים בפורמט ישראלי בלבד (dd/MM/yyyy), שעון ישראל, 24 שעות
export const TZ = "Asia/Jerusalem";

function parts(d: string | Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("he-IL", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short",
    }).formatToParts(new Date(d)).map((x) => [x.type, x.value]),
  );
  return p as Record<"year" | "month" | "day" | "hour" | "minute" | "weekday", string>;
}

/** 26/10 — עם שנה אם אינה השנה הנוכחית */
export function fmtDate(d: string | Date) {
  const p = parts(d);
  return p.year === parts(new Date()).year ? `${p.day}/${p.month}` : `${p.day}/${p.month}/${p.year}`;
}

/** 26/10/2026 */
export const fmtFull = (d: string | Date) => { const p = parts(d); return `${p.day}/${p.month}/${p.year}`; };

/** יום א׳ · 26/10 · 18:30 */
export function fmtSession(d: string | Date) {
  const p = parts(d);
  return `${p.weekday} · ${fmtDate(d)} · ${p.hour}:${p.minute}`;
}

/** yyyy-MM-dd של היום בשעון ישראל, בתוספת ימים */
export function isoDay(offset = 0) {
  const p = parts(new Date(Date.now() + offset * 86_400_000));
  return { iso: `${p.year}-${p.month}-${p.day}`, label: `${p.weekday} · ${p.day}/${p.month}/${p.year}` };
}
