import { signOut } from "@/auth";
import { Icon } from "./Icon";

export function SignOut({ compact = false }: { compact?: boolean }) {
  return (
    <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
      <button className={`btn ghost${compact ? " icon" : ""}`} aria-label="יציאה"><Icon name="logout" />{!compact && "יציאה"}</button>
    </form>
  );
}
