export function PageHeader({ title, description, actions }: { title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <header className="page-header">
      <div className="grow">
        <h1>{title}</h1>
        {description && <p className="faint">{description}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </header>
  );
}
