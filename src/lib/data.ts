import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export type ParentRow = {
  id: string; parent_name: string; baby_name: string | null; email: string; phone: string | null;
  card_id: string | null; card_name: string | null; entries: number | null; used: number; paid: boolean | null;
};

export async function parentsWithBalance(includeInactive = false): Promise<ParentRow[]> {
  const r = await db().execute(sql`
    SELECT u.id, u.parent_name, u.baby_name, u.email, u.phone,
           c.id AS card_id, c.name AS card_name, c.entries, c.paid, COALESCE(v.n, 0)::int AS used
    FROM users u
    LEFT JOIN LATERAL (
      SELECT id, name, entries, paid FROM cards WHERE user_id = u.id AND closed_at IS NULL ORDER BY created_at LIMIT 1
    ) c ON true
    LEFT JOIN LATERAL (
      SELECT count(*) AS n FROM visits WHERE card_id = c.id AND voided_at IS NULL
    ) v ON true
    WHERE u.role = 'parent' ${includeInactive ? sql`` : sql`AND u.active`}
    ORDER BY u.parent_name`);
  return r.rows as ParentRow[];
}

export type CardRow = {
  id: string; name: string; entries: number; price: number; paid: boolean;
  created_at: string; closed_at: string | null; used: number;
};

export async function cardsFor(userId: string): Promise<CardRow[]> {
  const r = await db().execute(sql`
    SELECT c.id, c.name, c.entries, c.price, c.paid, c.created_at, c.closed_at,
           (SELECT count(*) FROM visits v WHERE v.card_id = c.id AND v.voided_at IS NULL)::int AS used
    FROM cards c WHERE c.user_id = ${userId}
    ORDER BY c.closed_at IS NULL DESC, c.created_at DESC`);
  return r.rows as CardRow[];
}

export type VisitRow = { id: string; visited_at: string; workshop: string | null; voided_at: string | null };

export async function visitsFor(userId: string, withVoided: boolean, limit = 30): Promise<VisitRow[]> {
  const r = await db().execute(sql`
    SELECT v.id, v.visited_at, v.voided_at, w.name AS workshop
    FROM visits v LEFT JOIN workshop_types w ON w.id = v.workshop_type_id
    WHERE v.user_id = ${userId} ${withVoided ? sql`` : sql`AND v.voided_at IS NULL`}
    ORDER BY v.visited_at DESC LIMIT ${limit}`);
  return r.rows as VisitRow[];
}

export type SessionRow = { id: string; starts_at: string; location: string | null; workshop: string };

export async function upcomingSessions(limit = 6): Promise<SessionRow[]> {
  const r = await db().execute(sql`
    SELECT s.id, s.starts_at, s.location, w.name AS workshop
    FROM workshop_sessions s JOIN workshop_types w ON w.id = s.workshop_type_id
    WHERE s.starts_at >= now() - interval '2 hours'
    ORDER BY s.starts_at LIMIT ${limit}`);
  return r.rows as SessionRow[];
}

export { fmtDate, fmtSession } from "./formatDate";
