export type Tone = "neutral" | "success" | "warning" | "info" | "danger";

export function StatusBadge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`tag ${tone}`}>{children}</span>;
}
