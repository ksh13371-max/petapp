export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "amber" | "brand" | "ink";
}) {
  const valueColor = accent === "amber" ? "text-amber-500" : accent === "brand" ? "text-brand-600" : "text-ink-900";
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <p className="text-[13px] font-bold text-ink-500">{label}</p>
      <p className={`mt-2 text-[32px] font-extrabold leading-none ${valueColor}`}>{value}</p>
      {sub && <p className="mt-2 text-[12px] text-ink-400">{sub}</p>}
    </div>
  );
}
