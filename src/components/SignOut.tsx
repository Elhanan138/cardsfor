import { signOut } from "@/auth";
import { Icon } from "./Icon";

export function SignOut() {
  return (
    <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
      <button className="btn ghost"><Icon name="logout" />יציאה</button>
    </form>
  );
}
