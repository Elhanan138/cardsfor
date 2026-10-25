import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { ActionForm } from "@/components/ActionForm";
import { Field } from "@/components/Field";
import { createFirstAdmin } from "./actions";

export default async function Setup({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const expected = process.env.SETUP_TOKEN;
  if (!expected || token !== expected) notFound();
  const admins = await db().select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.role, "admin")).limit(1);
  if (admins.length) notFound();
  return (
    <main className="wrap narrow-top">
      <div className="card stack">
        <h1>מנהל ראשון</h1>
        <ActionForm action={createFirstAdmin.bind(null, token!)} submit="יצירה">
          <Field label="שם" required><input name="parentName" required /></Field>
          <Field label="מייל" required><input name="email" type="email" required dir="ltr" /></Field>
          <Field label="סיסמה" required help="לפחות 10 תווים"><input name="password" type="password" minLength={10} required dir="ltr" /></Field>
        </ActionForm>
      </div>
    </main>
  );
}
