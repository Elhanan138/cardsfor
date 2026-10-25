"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";

export async function createFirstAdmin(token: string, _: { error?: string; ok?: string } | undefined, fd: FormData) {
  if (!process.env.SETUP_TOKEN || token !== process.env.SETUP_TOKEN) return { error: "אין הרשאה" };
  const existing = await db().select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.role, "admin")).limit(1);
  if (existing.length) return { error: "כבר קיים מנהל" };
  const p = z.object({
    email: z.string().trim().toLowerCase().email("מייל לא תקין"),
    password: z.string().min(10, "לפחות 10 תווים").max(100),
    parentName: z.string().trim().min(1, "חסר שם").max(120),
  }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  await db().insert(schema.users).values({
    email: p.data.email, parentName: p.data.parentName, role: "admin", passwordHash: await bcrypt.hash(p.data.password, 10),
  });
  redirect("/login");
}
