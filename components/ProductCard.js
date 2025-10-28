export default function ProductCard({
  title,
  description,
  price,
  priceId,
  mode,
  onPurchase,
  isLoading,
}) {
  return (
    <article className="group relative flex flex-col rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm transition duration-200 hover:-translate-y-2 hover:shadow-soft">
      <div className="absolute inset-x-5 top-0 h-24 rounded-b-3xl bg-gradient-to-b from-brand/10 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="relative flex-1 space-y-4">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      </div>
      <div className="relative mt-8 flex items-center justify-between">
        <span className="text-lg font-semibold text-slate-900">{price}</span>
        <button
          type="button"
          onClick={() => onPurchase?.(priceId, mode)}
          disabled={Boolean(isLoading)}
          className={[
            "rounded-full px-5 py-2 text-sm font-semibold shadow-sm transition duration-200",
            isLoading
              ? "bg-slate-300 text-slate-500"
              : "bg-slate-900 text-white hover:-translate-y-0.5 hover:shadow-lg",
          ].join(" ")}
        >
          {isLoading ? "Starting..." : "Buy Now"}
        </button>
      </div>
    </article>
  );
}
