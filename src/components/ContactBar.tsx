"use client";

import { useState } from "react";

const intl = (p: string) => p.replace(/[^\d]/g, "").replace(/^0/, "972");

export function ContactBar({ amount, highlightBit, bitPhone, bitUrl, whatsapp, call }: {
  amount: number; highlightBit: boolean; bitPhone: string | null; bitUrl: string | null; whatsapp: string | null; call: string | null;
}) {
  const [note, setNote] = useState<string | null>(null);

  async function payBit() {
    const parts = [bitPhone && `מספר: ${bitPhone}`, amount ? `סכום: ${amount} ₪` : null].filter(Boolean).join(" · ");
    try { await navigator.clipboard.writeText(amount ? String(amount) : bitPhone ?? ""); } catch { /* דפדפן חוסם — ממשיכים */ }
    setNote(`${parts}. הסכום הועתק — הדביקו בביט.`);
    if (bitUrl) window.location.href = bitUrl;
  }

  if (!bitPhone && !bitUrl && !whatsapp && !call) return null;
  return (
    <section className="stack" style={{ gap: 8 }}>
      <div className="contact">
        {(bitPhone || bitUrl) && <button type="button" className={`btn ${highlightBit ? "primary" : ""}`} onClick={payBit}>תשלום בביט</button>}
        {whatsapp && <a className="btn" href={`https://wa.me/${intl(whatsapp)}`} target="_blank" rel="noopener noreferrer">וואטסאפ</a>}
        {call && <a className="btn" href={`tel:${call.replace(/[^\d+]/g, "")}`}>חיוג</a>}
      </div>
      {note && <p className="faint" role="status" style={{ margin: 0 }}>{note}</p>}
    </section>
  );
}
