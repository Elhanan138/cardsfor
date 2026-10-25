"use client";

import { useState } from "react";
import { isoDay } from "@/lib/formatDate";
import { Field } from "./Field";

const DAYS = 120;
const TIMES = Array.from({ length: (22 - 6) * 4 + 1 }, (_, i) => {
  const m = 6 * 60 + i * 15;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
});

/** בחירת יום ושעה בפורמט ישראלי; שולח startsAt כ-yyyy-MM-ddTHH:mm (שעון ישראל) */
export function SessionTimeField({ name = "startsAt" }: { name?: string }) {
  const [days] = useState(() => Array.from({ length: DAYS }, (_, i) => isoDay(i)));
  const [day, setDay] = useState(days[0].iso);
  const [time, setTime] = useState("10:00");
  return (
    <div className="grid2">
      <Field label="יום" required>
        <select value={day} onChange={(e) => setDay(e.target.value)} suppressHydrationWarning>
          {days.map((d) => <option key={d.iso} value={d.iso} suppressHydrationWarning>{d.label}</option>)}
        </select>
      </Field>
      <Field label="שעה" required>
        <select value={time} onChange={(e) => setTime(e.target.value)} className="ltr">
          {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <input type="hidden" name={name} value={`${day}T${time}`} />
    </div>
  );
}
