import "server-only";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, schema } from "@/db";

async function current() {
  const s = await auth();
  const id = (s?.user as { id?: string } | undefined)?.id;
  if (!id) redirect("/login");
  const [u] = await db().select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  if (!u || !u.active) redirect("/login");
  return u;
}

export async function requireAdmin() {
  const u = await current();
  if (u.role !== "admin") redirect("/me");
  return u;
}

export async function requireParent() {
  const u = await current();
  if (u.role === "admin") redirect("/admin");
  return u;
}

export async function audit(actorId: string, action: string, entity: string, entityId: string | null, detail?: unknown) {
  await db().insert(schema.auditLog).values({ actorId, action, entity, entityId, detail: detail ?? null });
}
