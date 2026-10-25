import "server-only";
import { cache } from "react";
import { db, schema } from "@/db";

export const getSettings = cache(async () => {
  try {
    const [s] = await db().select().from(schema.settings).limit(1);
    return s ?? null;
  } catch {
    return null;
  }
});
