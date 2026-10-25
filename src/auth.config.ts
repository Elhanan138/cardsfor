import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const p = request.nextUrl.pathname;
      const role = (auth?.user as { role?: string } | undefined)?.role;
      if (p.startsWith("/admin")) return role === "admin";
      if (p.startsWith("/me")) return !!auth?.user;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.uid = (user as { id: string }).id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      Object.assign(session.user, { id: token.uid as string, role: token.role as string });
      return session;
    },
  },
} satisfies NextAuthConfig;
