/** 050-1234567 → 972501234567 (לקישורי וואטסאפ) */
export const intlPhone = (p: string) => p.replace(/[^\d]/g, "").replace(/^0/, "972");
export const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
export const waHref = (p: string) => `https://wa.me/${intlPhone(p)}`;
