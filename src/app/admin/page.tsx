import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/guards";
import { parentsWithBalance } from "@/lib/data";
import { PunchList } from "./PunchList";

export default async function PunchPage() {
  await requireAdmin();
  const [parents, types] = await Promise.all([
    parentsWithBalance(),
    db().select().from(schema.workshopTypes).where(eq(schema.workshopTypes.active, true)).orderBy(asc(schema.workshopTypes.name)),
  ]);
  return (
    <main className="wrap">
      <PunchList parents={parents} types={types.map((t) => ({ id: t.id, name: t.name }))} />
    </main>
  );
}
