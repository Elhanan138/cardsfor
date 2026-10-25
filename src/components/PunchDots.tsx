export function PunchDots({ entries, used }: { entries: number; used: number }) {
  return (
    <div className="dots" aria-label={`נוקבו ${used} מתוך ${entries}`}>
      {Array.from({ length: entries }, (_, i) => <span key={i} className={i < used ? "punched" : ""} />)}
    </div>
  );
}
