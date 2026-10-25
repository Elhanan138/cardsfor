import { requireAdmin } from "@/lib/guards";
import { getSettings } from "@/lib/settings";
import { AdminNav } from "@/components/AdminNav";
import { Brand } from "@/components/Brand";
import { SignOut } from "@/components/SignOut";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const s = await getSettings();
  return (
    <>
      <header className="top">
        <Brand logo={s?.logoDataUrl} name={s?.businessName} />
        <SignOut compact />
      </header>
      <AdminNav />
      {children}
    </>
  );
}
