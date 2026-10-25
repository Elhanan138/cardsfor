import { pgTable, uuid, text, boolean, integer, timestamp, jsonb, bigserial } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "parent"] }).notNull(),
  parentName: text("parent_name").notNull(),
  babyName: text("baby_name"),
  phone: text("phone"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workshopTypes = pgTable("workshop_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
});

export const cardTemplates = pgTable("card_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  entries: integer("entries").notNull(),
  price: integer("price").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const cards = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  templateId: uuid("template_id"),
  name: text("name").notNull(),
  entries: integer("entries").notNull(),
  price: integer("price").notNull().default(0),
  paid: boolean("paid").notNull().default(false),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  paidBy: uuid("paid_by"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

export const workshopSessions = pgTable("workshop_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workshopTypeId: uuid("workshop_type_id").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  location: text("location"),
});

export const visits = pgTable("visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  cardId: uuid("card_id").notNull(),
  userId: uuid("user_id").notNull(),
  workshopTypeId: uuid("workshop_type_id"),
  visitedAt: timestamp("visited_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid("created_by"),
  voidedAt: timestamp("voided_at", { withTimezone: true }),
  voidedBy: uuid("voided_by"),
});

export type Theme = {
  primary: string; onPrimary: string; primarySoft: string; primaryText: string; accent: string;
};

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  businessName: text("business_name").notNull().default("הסדנה"),
  bitPhone: text("bit_phone"),
  bitUrl: text("bit_url"),
  whatsappPhone: text("whatsapp_phone"),
  callPhone: text("call_phone"),
  logoDataUrl: text("logo_data_url"),
  theme: jsonb("theme").$type<Theme | null>(),
});

export const auditLog = pgTable("audit_log", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  actorId: uuid("actor_id"),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  detail: jsonb("detail"),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
});

export const loginAttempts = pgTable("login_attempts", {
  email: text("email").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
});
