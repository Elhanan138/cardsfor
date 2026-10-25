export function ListSkeleton({ rows = 5, action = false }: { rows?: number; action?: boolean }) {
  return (
    <ul className="list skel-list" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i}>
          <div className="grow stack tight">
            <div className="skel line w-a" />
            <div className="skel line w-b" />
          </div>
          {action && <div className="skel btn-s" />}
        </li>
      ))}
    </ul>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <section className="card stack skel-card" aria-hidden="true">
      <div className="skel title" />
      {Array.from({ length: lines }, (_, i) => <div key={i} className="skel line" />)}
    </section>
  );
}

export function PageSkeleton({ children }: { children: React.ReactNode }) {
  return <main className="wrap stack" aria-busy="true" aria-label="טוען">{children}</main>;
}
