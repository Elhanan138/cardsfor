import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const s = await auth();
  const role = (s?.user as { role?: string } | undefined)?.role;
  redirect(role === "admin" ? "/admin" : role ? "/me" : "/login");
}
