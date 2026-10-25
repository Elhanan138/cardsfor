"use server";

import bcrypt from "bcryptjs";
import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { audit, requireAdmin } from "@/lib/guards";

const uuid = z.string().uuid();
const txt = (max = 120) => z.string().trim().max(max);
const optTxt = (max = 120) => z.string().trim().max(max).optional().transform((v) => (v ? v : null));
const phone = z.string().trim().max(20).regex(/^[0-9+\-\s]*$/, "מספר לא תקין").optional().transform((v) => (v ? v : null));

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/me");
}

export type FormState = { error?: string; ok?: string } | undefined;

/* ---------- ניקוב ---------- */

export async function punch(userId: string, workshopTypeId: string | null) {
  const admin = await requireAdmin();
  uuid.parse(userId);
  if (workshopTypeId) uuid.parse(workshopTypeId);

  // הוספה אטומית: רק אם יש כרטיסייה פתוחה ויתרה > 0 (נעילת שורה מונעת ניקוב כפול במקביל)
  const r = await db().execute(sql`
    WITH c AS (
      SELECT id, entries FROM cards WHERE user_id = ${userId} AND closed_at IS NULL
      ORDER BY created_at LIMIT 1 FOR UPDATE
    ), used AS (
      SELECT count(*)::int AS n FROM visits, c WHERE visits.card_id = c.id AND visits.voided_at IS NULL
    ), ins AS (
      INSERT INTO visits (card_id, user_id, workshop_type_id, created_by)
      SELECT c.id, ${userId}::uuid, ${workshopTypeId}::uuid, ${admin.id}::uuid FROM c, used WHERE used.n < c.entries
      RETURNING id, card_id
    )
    SELECT ins.id, ins.card_id, c.entries, used.n + 1 AS used FROM ins, c, used`);
  const row = r.rows[0] as { id: string; card_id: string; entries: number; used: number } | undefined;
  if (!row) return { error: "אין כרטיסייה פתוחה עם יתרה" } as const;

  if (row.used >= row.entries) {
    await db().update(schema.cards).set({ closedAt: new Date() }).where(eq(schema.cards.id, row.card_id));
  }
  await audit(admin.id, "punch", "visit", row.id, { userId });
  refresh();
  return { visitId: row.id, remaining: row.entries - row.used } as const;
}

export async function voidVisit(visitId: string) {
  const admin = await requireAdmin();
  uuid.parse(visitId);
  const [v] = await db()
    .update(schema.visits)
    .set({ voidedAt: new Date(), voidedBy: admin.id })
    .where(and(eq(schema.visits.id, visitId), isNull(schema.visits.voidedAt)))
    .returning({ cardId: schema.visits.cardId });
  if (!v) return { error: "הניקוב כבר בוטל" };
  await db().update(schema.cards).set({ closedAt: null }).where(eq(schema.cards.id, v.cardId));
  await audit(admin.id, "void", "visit", visitId);
  refresh();
  return { ok: true };
}

/* ---------- הורים ---------- */

const parentSchema = z.object({
  email: z.string().trim().toLowerCase().email("מייל לא תקין").max(200),
  password: z.string().min(8, "סיסמה לפחות 8 תווים").max(100),
  parentName: txt().min(1, "חסר שם הורה"),
  babyName: optTxt(),
  phone,
  templateId: z.string().optional(),
});

export async function createParent(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const p = parentSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  const exists = await db().select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, p.data.email)).limit(1);
  if (exists.length) return { error: "המייל כבר קיים במערכת" };

  const [u] = await db().insert(schema.users).values({
    email: p.data.email,
    passwordHash: await bcrypt.hash(p.data.password, 10),
    role: "parent",
    parentName: p.data.parentName,
    babyName: p.data.babyName,
    phone: p.data.phone,
  }).returning({ id: schema.users.id });

  if (p.data.templateId && uuid.safeParse(p.data.templateId).success) {
    await openCardFromTemplate(u.id, p.data.templateId, admin.id);
  }
  await audit(admin.id, "create", "parent", u.id);
  refresh();
  redirect(`/admin/parents/${u.id}`);
}

export async function updateParent(userId: string, _: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  uuid.parse(userId);
  const p = z.object({ parentName: txt().min(1, "חסר שם הורה"), babyName: optTxt(), phone }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  await db().update(schema.users).set(p.data).where(and(eq(schema.users.id, userId), eq(schema.users.role, "parent")));
  await audit(admin.id, "update", "parent", userId, p.data);
  refresh();
  return { ok: "נשמר" };
}

export async function resetPassword(userId: string, _: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  uuid.parse(userId);
  const pw = z.string().min(8, "סיסמה לפחות 8 תווים").max(100).safeParse(fd.get("password"));
  if (!pw.success) return { error: pw.error.issues[0].message };
  await db().update(schema.users).set({ passwordHash: await bcrypt.hash(pw.data, 10) }).where(eq(schema.users.id, userId));
  await audit(admin.id, "reset_password", "user", userId);
  return { ok: "הסיסמה עודכנה" };
}

export async function setActive(userId: string, active: boolean) {
  const admin = await requireAdmin();
  uuid.parse(userId);
  if (userId === admin.id) return;
  await db().update(schema.users).set({ active }).where(eq(schema.users.id, userId));
  await audit(admin.id, active ? "activate" : "deactivate", "user", userId);
  refresh();
}

/* ---------- כרטיסיות ---------- */

async function openCardFromTemplate(userId: string, templateId: string, adminId: string) {
  const [t] = await db().select().from(schema.cardTemplates).where(eq(schema.cardTemplates.id, templateId)).limit(1);
  if (!t) return null;
  const [c] = await db().insert(schema.cards).values({
    userId, templateId: t.id, name: t.name, entries: t.entries, price: t.price, createdBy: adminId,
  }).returning({ id: schema.cards.id });
  return c.id;
}

export async function createCard(userId: string, _: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  uuid.parse(userId);
  const templateId = String(fd.get("templateId") ?? "");
  let cardId: string | null = null;
  if (templateId && templateId !== "custom") {
    if (!uuid.safeParse(templateId).success) return { error: "תבנית לא תקינה" };
    cardId = await openCardFromTemplate(userId, templateId, admin.id);
  } else {
    const p = z.object({
      name: txt(60).min(1, "חסר שם כרטיסייה"),
      entries: z.coerce.number().int().min(1, "לפחות כניסה אחת").max(200),
      price: z.coerce.number().int().min(0).max(100000),
    }).safeParse(Object.fromEntries(fd));
    if (!p.success) return { error: p.error.issues[0].message };
    const [c] = await db().insert(schema.cards).values({ userId, ...p.data, createdBy: admin.id }).returning({ id: schema.cards.id });
    cardId = c.id;
  }
  if (!cardId) return { error: "לא נוצרה כרטיסייה" };
  await audit(admin.id, "create", "card", cardId, { userId });
  refresh();
  return { ok: "כרטיסייה נפתחה" };
}

export async function setPaid(cardId: string, paid: boolean) {
  const admin = await requireAdmin();
  uuid.parse(cardId);
  await db().update(schema.cards)
    .set({ paid, paidAt: paid ? new Date() : null, paidBy: paid ? admin.id : null })
    .where(eq(schema.cards.id, cardId));
  await audit(admin.id, paid ? "mark_paid" : "mark_unpaid", "card", cardId);
  refresh();
}

/* ---------- הגדרות ---------- */

export async function saveBusiness(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const p = z.object({
    businessName: txt(60).min(1, "חסר שם עסק"),
    bitPhone: phone, whatsappPhone: phone, callPhone: phone,
    bitUrl: z.string().trim().max(300).optional().transform((v) => (v ? v : null))
      .refine((v) => !v || /^https:\/\//.test(v), "קישור ביט חייב להתחיל ב-https://"),
  }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  await db().update(schema.settings).set(p.data).where(eq(schema.settings.id, 1));
  await audit(admin.id, "update", "settings", "1");
  refresh();
  return { ok: "נשמר" };
}

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export async function saveTheme(logoDataUrl: string | null, theme: { primary: string; onPrimary: string; primarySoft: string; primaryText: string; accent: string } | null) {
  const admin = await requireAdmin();
  if (logoDataUrl !== null && (!/^data:image\/(png|webp|jpeg);base64,[A-Za-z0-9+/=]+$/.test(logoDataUrl) || logoDataUrl.length > 400_000)) {
    return { error: "לוגו לא תקין או גדול מדי" };
  }
  if (theme && !z.object({ primary: hex, onPrimary: hex, primarySoft: hex, primaryText: hex, accent: hex }).safeParse(theme).success) {
    return { error: "ערכת נושא לא תקינה" };
  }
  await db().update(schema.settings).set({ logoDataUrl, theme }).where(eq(schema.settings.id, 1));
  await audit(admin.id, "update", "theme", "1");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function addWorkshopType(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const p = txt(60).min(1, "חסר שם סדנה").safeParse(fd.get("name"));
  if (!p.success) return { error: p.error.issues[0].message };
  await db().insert(schema.workshopTypes).values({ name: p.data });
  await audit(admin.id, "create", "workshop_type", null, { name: p.data });
  refresh();
  return { ok: "נוספה" };
}

export async function toggleWorkshopType(id: string, active: boolean) {
  const admin = await requireAdmin();
  uuid.parse(id);
  await db().update(schema.workshopTypes).set({ active }).where(eq(schema.workshopTypes.id, id));
  await audit(admin.id, "toggle", "workshop_type", id, { active });
  refresh();
}

export async function addTemplate(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const p = z.object({
    name: txt(60).min(1, "חסר שם"),
    entries: z.coerce.number().int().min(1, "לפחות כניסה אחת").max(200),
    price: z.coerce.number().int().min(0).max(100000),
  }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  await db().insert(schema.cardTemplates).values(p.data);
  await audit(admin.id, "create", "card_template", null, p.data);
  refresh();
  return { ok: "נוספה" };
}

export async function toggleTemplate(id: string, active: boolean) {
  const admin = await requireAdmin();
  uuid.parse(id);
  await db().update(schema.cardTemplates).set({ active }).where(eq(schema.cardTemplates.id, id));
  await audit(admin.id, "toggle", "card_template", id, { active });
  refresh();
}

export async function addSession(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const p = z.object({
    workshopTypeId: uuid,
    startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "תאריך ושעה חסרים"),
    location: optTxt(80),
  }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  // הקלט הוא שעון ישראל; ממירים ל-timestamptz בשרת
  await db().execute(sql`
    INSERT INTO workshop_sessions (workshop_type_id, starts_at, location)
    VALUES (${p.data.workshopTypeId}::uuid, (${p.data.startsAt}::timestamp AT TIME ZONE 'Asia/Jerusalem'), ${p.data.location})`);
  await audit(admin.id, "create", "session", null, p.data);
  refresh();
  return { ok: "נוסף" };
}

export async function deleteSession(id: string) {
  const admin = await requireAdmin();
  uuid.parse(id);
  await db().delete(schema.workshopSessions).where(eq(schema.workshopSessions.id, id));
  await audit(admin.id, "delete", "session", id);
  refresh();
}

export async function addAdmin(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const p = z.object({
    email: z.string().trim().toLowerCase().email("מייל לא תקין").max(200),
    password: z.string().min(10, "סיסמת מנהל לפחות 10 תווים").max(100),
    parentName: txt().min(1, "חסר שם"),
  }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  const exists = await db().select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, p.data.email)).limit(1);
  if (exists.length) return { error: "המייל כבר קיים במערכת" };
  const [u] = await db().insert(schema.users).values({
    email: p.data.email, parentName: p.data.parentName, role: "admin", passwordHash: await bcrypt.hash(p.data.password, 10),
  }).returning({ id: schema.users.id });
  await audit(admin.id, "create", "admin", u.id);
  refresh();
  return { ok: "מנהל נוסף" };
}
