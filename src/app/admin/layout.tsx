import { requireAdmin } from "@/lib/guards";
import { getSettings } from "@/lib/settings";
import { AdminNav } from "@/components/AdminNav";
import { signOut } from "@/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const s = await getSettings();
  return (
    <>
      <header className="top">
        {s?.logoDataUrl ? <img src={s.logoDataUrl} alt={s.businessName} /> : <h2>{s?.businessName}</h2>}
        <div className="row" style={{ gap: 4 }}>
          <AdminNav />
          <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
            <button className="btn ghost">יציאה</button>
          </form>
        </div>
      </header>
      {children}
    </>
  );
}
