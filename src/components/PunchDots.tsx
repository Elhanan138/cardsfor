export function PunchDots({ entries, used, align = "center" }: { entries: number; used: number; align?: "center" | "start" }) {
  return (
    <div className={`dots${align === "start" ? " start" : ""}`} role="img" aria-label={`נוקבו ${used} מתוך ${entries}`}>
      {Array.from({ length: entries }, (_, i) => <span key={i} className={i < used ? "punched" : ""} />)}
    </div>
  );
}
