export type RGB = [number, number, number];

export const hexToRgb = (h: string): RGB => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const rgbToHex = ([r, g, b]: RGB) =>
  "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");

const lin = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
export const luminance = ([r, g, b]: RGB) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
export const contrast = (a: RGB, b: RGB) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
export const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];

export function deriveTheme(primaryHex: string, accentHex?: string) {
  let p = hexToRgb(primaryHex);
  // כפתור עם טקסט לבן צריך ניגודיות 4.5 לפחות; אם הצבע בהיר מדי — מכהים בהדרגה
  let onPrimary = WHITE;
  let i = 0;
  while (contrast(p, WHITE) < 4.5 && i++ < 20) p = mix(p, BLACK, 0.08);
  if (contrast(p, WHITE) < 4.5) onPrimary = BLACK;
  let text = hexToRgb(primaryHex);
  i = 0;
  while (contrast(text, WHITE) < 4.5 && i++ < 30) text = mix(text, BLACK, 0.08);
  return {
    primary: rgbToHex(p),
    onPrimary: rgbToHex(onPrimary),
    primarySoft: rgbToHex(mix(hexToRgb(primaryHex), WHITE, 0.86)),
    primaryText: rgbToHex(text),
    accent: accentHex ?? rgbToHex(mix(hexToRgb(primaryHex), WHITE, 0.5)),
  };
}

const sat = ([r, g, b]: RGB) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx === 0 ? 0 : (mx - mn) / mx; };
const hue = ([r, g, b]: RGB) => {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!d) return 0;
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
};

/** פלטה מתוך פיקסלים (RGBA). מחזיר צבעים דומיננטיים רוויים, ממוינים לפי משקל */
export function extractPalette(data: Uint8ClampedArray): string[] {
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a < 128) continue;
    const l = luminance([r, g, b]);
    if (l > 0.92 || l < 0.01) continue;
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const e = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    e.n++; e.r += r; e.g += g; e.b += b;
    buckets.set(key, e);
  }
  const cols = [...buckets.values()]
    .map((e) => { const c: RGB = [e.r / e.n, e.g / e.n, e.b / e.n]; return { c, w: e.n * (0.3 + sat(c)) }; })
    .sort((a, b) => b.w - a.w);
  const out: RGB[] = [];
  for (const { c } of cols) {
    if (out.every((o) => Math.abs(hue(o) - hue(c)) > 25 || Math.abs(luminance(o) - luminance(c)) > 0.25)) out.push(c);
    if (out.length === 5) break;
  }
  return out.map(rgbToHex);
}
