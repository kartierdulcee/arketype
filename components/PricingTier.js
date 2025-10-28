export default function PricingTier({
  title,
  description,
  price,
  billing,
  features,
  priceId,
  mode,
  highlight = false,
  onSelect,
  isLoading = false,
}) {
  return (
    <div
      className={[
        "flex h-full flex-col rounded-3xl border bg-white/80 p-8 shadow-sm transition duration-200",
        highlight
          ? "border-slate-900 shadow-soft hover:-translate-y-2"
          : "border-slate-200 hover:-translate-y-1 hover:shadow-md",
      ].join(" ")}
    >
      <div className="flex-1 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            {mode === "subscription" ? "Subscription" : "One-time"}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h3>
          <p className="mt-3 text-sm text-slate-600">{description}</p>
        </div>
        <div>
          <span className="text-4xl font-semibold text-slate-900">{price}</span>
          {billing && <span className="ml-2 text-sm text-slate-500">{billing}</span>}
        </div>
        <ul className="space-y-3 text-sm text-slate-600">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-brand" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={() => onSelect?.(priceId, mode)}
        disabled={isLoading}
        className={[
          "mt-8 rounded-full px-6 py-3 text-sm font-semibold transition duration-200",
          highlight
            ? "bg-slate-900 text-white shadow-soft hover:-translate-y-1 hover:shadow-lg disabled:translate-y-0 disabled:bg-slate-400 disabled:shadow-none"
            : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:-translate-y-1 hover:shadow disabled:border-slate-200 disabled:text-slate-400 disabled:translate-y-0 disabled:shadow-none",
        ].join(" ")}
      >
        {isLoading ? "Loading…" : "Choose Plan"}
      </button>
    </div>
  );
}
