"use client";

import { useState } from "react";
import { telHref, waHref } from "@/lib/phone";
import { Icon } from "./Icon";

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
    <section className="stack tight" aria-label="תשלום ויצירת קשר">
      <div className="contact">
        {(bitPhone || bitUrl) && (
          <button type="button" className={`btn ${highlightBit ? "primary" : ""}`} onClick={payBit}>
            <Icon name="wallet" />{highlightBit && amount ? `תשלום ${amount.toLocaleString("he-IL")} ₪ בביט` : "תשלום בביט"}
          </button>
        )}
        {whatsapp && <a className="btn" href={waHref(whatsapp)} target="_blank" rel="noopener noreferrer"><Icon name="message" />וואטסאפ</a>}
        {call && <a className="btn" href={telHref(call)}><Icon name="phone" />חיוג</a>}
      </div>
      {note && <p className="faint m0" role="status">{note}</p>}
    </section>
  );
}
