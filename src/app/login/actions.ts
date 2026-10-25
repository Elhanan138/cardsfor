"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function login(_: string | undefined, fd: FormData) {
  try {
    await signIn("credentials", {
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
      redirectTo: "/",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return (e as AuthError & { code?: string }).code === "locked"
        ? "יותר מדי ניסיונות. נסו שוב בעוד 15 דקות."
        : "מייל או סיסמה שגויים";
    }
    throw e;
  }
}
