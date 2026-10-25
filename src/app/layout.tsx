import type { Metadata, Viewport } from "next";
import { getSettings } from "@/lib/settings";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: s?.businessName ?? "כרטיסיות", robots: { index: false } };
}
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const t = s?.theme;
  const vars = t
    ? `:root{--primary:${t.primary};--on-primary:${t.onPrimary};--primary-soft:${t.primarySoft};--primary-text:${t.primaryText};--accent:${t.accent}}`
    : "";
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600&family=Varela+Round&display=swap" rel="stylesheet" />
        {vars && <style>{vars}</style>}
      </head>
      <body>{children}</body>
    </html>
  );
}
