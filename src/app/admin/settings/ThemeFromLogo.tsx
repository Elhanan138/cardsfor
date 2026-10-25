"use client";

import { useState, useTransition } from "react";
import { DEFAULT_ACCENT, DEFAULT_PRIMARY, deriveTheme, extractPalette } from "@/lib/color";
import { Field } from "@/components/Field";
import { Icon } from "@/components/Icon";
import type { Theme } from "@/db/schema";
import { saveTheme } from "../actions";

const MAX = 256;

async function loadLogo(file: File): Promise<{ dataUrl: string; palette: string[] }> {
  const img = new Image();
  const url = URL.createObjectURL(file);
  try {
    img.src = url;
    await img.decode();
    const k = Math.min(1, MAX / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.width * k));
    c.height = Math.max(1, Math.round(img.height * k));
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const palette = extractPalette(ctx.getImageData(0, 0, c.width, c.height).data);
    return { dataUrl: c.toDataURL("image/png"), palette };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ThemeFromLogo({ initialLogo, initialTheme }: { initialLogo: string | null; initialTheme: Theme | null }) {
  const [logo, setLogo] = useState(initialLogo);
  const [palette, setPalette] = useState<string[]>([]);
  const [primary, setPrimary] = useState(initialTheme?.primary ?? DEFAULT_PRIMARY);
  const [accent, setAccent] = useState(initialTheme?.accent ?? DEFAULT_ACCENT);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const theme = { ...deriveTheme(primary, accent) };

  async function onFile(f: File | undefined) {
    setMsg(null);
    if (!f) return;
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(f.type)) { setMsg("PNG, JPG, WEBP או SVG בלבד"); return; }
    try {
      const r = await loadLogo(f);
      setLogo(r.dataUrl);
      setPalette(r.palette);
      if (r.palette[0]) setPrimary(r.palette[0]);
      if (r.palette[1]) setAccent(r.palette[1]);
    } catch { setMsg("לא הצלחנו לקרוא את הקובץ"); }
  }

  return (
    <div className="stack">
      <div className="row">
        {logo && <img src={logo} alt="לוגו" className="logo-preview" />}
        <label className="btn"><Icon name="plus" />העלאת לוגו<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e) => onFile(e.target.files?.[0])} /></label>
        {logo && <button type="button" className="btn ghost danger" onClick={() => setLogo(null)}>הסרת לוגו</button>}
      </div>

      {palette.length > 0 && (
        <div className="row" aria-label="צבעים מהלוגו">
          {palette.map((c) => (
            <button key={c} type="button" className="swatch" onClick={() => setPrimary(c)} aria-label={`צבע ראשי ${c}`} aria-pressed={c === primary}
              style={{ background: c }} />
          ))}
        </div>
      )}

      <div className="grid2">
        <Field label="צבע ראשי"><input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} /></Field>
        <Field label="צבע משני"><input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} /></Field>
      </div>

      {/* תצוגה מקדימה: ערכי המיתוג הם נתונים שהמשתמש בחר, לכן מוזרקים כאן ולא כטוקן קבוע */}
      <div className="card theme-preview" aria-label="תצוגה מקדימה" style={{ background: theme.primarySoft }}>
        <div className="between">
          <span className="num" style={{ color: theme.primaryText }}>6 נותרו</span>
          <span className="fake-btn" style={{ background: theme.primary, color: theme.onPrimary }}>נקב</span>
        </div>
        <div className="bar" style={{ background: theme.accent }} />
      </div>
      <p className="faint m0">הצבעים מותאמים אוטומטית לניגודיות קריאה.</p>

      <div className="row">
        <button type="button" className="btn primary" disabled={pending}
          onClick={() => start(async () => { const r = await saveTheme(logo, theme); setMsg(r.error ?? "נשמר"); })}>
          {pending ? "שומרים…" : "שמירת מיתוג"}
        </button>
        <button type="button" className="btn ghost" disabled={pending}
          onClick={() => start(async () => { const r = await saveTheme(logo, null); setPrimary(DEFAULT_PRIMARY); setAccent(DEFAULT_ACCENT); setMsg(r.error ?? "חזרנו לברירת המחדל"); })}>
          ברירת מחדל
        </button>
        {msg && <span className="msg" role="status">{msg}</span>}
      </div>
    </div>
  );
}
