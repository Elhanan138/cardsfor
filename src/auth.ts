import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { db, schema } from "./db";

const MAX_ATTEMPTS = 5;
const WINDOW_MIN = 15;

const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

class Locked extends CredentialsSignin { code = "locked"; }

const creds = z.object({ email: z.string().email().max(200), password: z.string().min(1).max(200) });

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = creds.safeParse(raw);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase().trim();

        const [att] = await db().execute(sql`
          INSERT INTO login_attempts (email, count, window_start) VALUES (${email}, 1, now())
          ON CONFLICT (email) DO UPDATE SET
            count = CASE WHEN login_attempts.window_start < now() - make_interval(mins => ${WINDOW_MIN}) THEN 1 ELSE login_attempts.count + 1 END,
            window_start = CASE WHEN login_attempts.window_start < now() - make_interval(mins => ${WINDOW_MIN}) THEN now() ELSE login_attempts.window_start END
          RETURNING count`).then((r) => r.rows as { count: number }[]);
        if (att && att.count > MAX_ATTEMPTS) throw new Locked();

        const [u] = await db().select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
        // השוואה גם כשאין משתמש — מונע זיהוי מיילים קיימים לפי זמן תגובה
        const ok = await bcrypt.compare(parsed.data.password, u?.passwordHash ?? DUMMY_HASH);
        if (!u || !ok || !u.active) return null;

        await db().delete(schema.loginAttempts).where(eq(schema.loginAttempts.email, email));
        return { id: u.id, email: u.email, name: u.parentName, role: u.role };
      },
    }),
  ],
});
