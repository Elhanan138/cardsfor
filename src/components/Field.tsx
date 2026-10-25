export function Field({ label, required, help, children }: { label: string; required?: boolean; help?: string; children: React.ReactNode }) {
  return (
    <label className="f">
      <span>{label}{required && <span className="req" aria-hidden="true"> *</span>}</span>
      {children}
      {help && <span className="help">{help}</span>}
    </label>
  );
}
