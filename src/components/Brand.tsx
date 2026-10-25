export function Brand({ logo, name }: { logo: string | null | undefined; name: string | undefined }) {
  return (
    <div className="brand">
      {logo ? <img src={logo} alt={name ?? "לוגו"} /> : <h2>{name}</h2>}
    </div>
  );
}
