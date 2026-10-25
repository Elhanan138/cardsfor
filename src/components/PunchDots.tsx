export function PunchDots({ entries, used, variant = "full" }: { entries: number; used: number; variant?: "full" | "start" | "mini" }) {
  return (
    <div className={`dots${variant === "full" ? "" : ` ${variant}`}`} role="img" aria-label={`נוקבו ${used} מתוך ${entries}`}>
      {Array.from({ length: entries }, (_, i) => <span key={i} className={i < used ? "punched" : ""} />)}
    </div>
  );
}
