import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="pointer-events-none h-full w-full bg-grid-pattern bg-[length:26px_26px] opacity-60" />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white via-white/80 to-transparent" />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-6 pb-20 pt-24 text-center md:px-10 md:text-left lg:flex-row lg:items-center">
        <div className="relative flex-1 space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-4 py-2 text-sm font-medium text-brand shadow-sm">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-brand" />
            AI Prompt Marketplace
          </span>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Build Smarter with AI-Optimized Prompts
            </h1>
            <p className="text-lg text-slate-600 sm:text-xl">
              PromptShop curates high-performing prompt templates so your team can launch campaigns, automate workflows, and craft brilliant content in minutes.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <Link
              href="#pricing"
              className="rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:border-slate-400 hover:-translate-y-1 hover:shadow"
            >
              Browse Prompts
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 md:justify-start">
            <div className="rounded-xl border border-slate-200 bg-white/70 px-5 py-3 shadow-sm backdrop-blur">
              <span className="block text-lg font-semibold text-slate-900">150+</span>
              Teams shipping with PromptShop
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/70 px-5 py-3 shadow-sm backdrop-blur">
              <span className="block text-lg font-semibold text-slate-900">4.9/5</span>
              Average user satisfaction
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="relative mx-auto max-w-xl rounded-3xl bg-white/70 p-2 shadow-soft backdrop-blur">
            <div className="absolute -left-6 top-10 hidden h-14 w-14 rotate-6 rounded-2xl bg-white shadow-lg md:flex md:flex-col md:items-center md:justify-center">
              <span className="text-xs font-semibold uppercase text-brand">New</span>
              <span className="text-[10px] text-slate-500">Weekly</span>
            </div>
            <div className="h-full w-full overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white via-brand/10 to-white p-8">
              <div className="grid gap-4 text-left text-slate-800">
                <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Campaign Booster</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    "Design a multi-step email nurture sequence for audiences who abandoned checkout."
                  </p>
                  <p className="mt-3 text-sm text-slate-500">
                    Tailored prompt pack for marketing ops teams working with HubSpot and Marketo.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Support Copilot</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    "Summarize support threads and generate tiered responses aligned with our tone guide."
                  </p>
                  <p className="mt-3 text-sm text-slate-500">
                    Toolkit built for CX leaders automating Zendesk triage with AI.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Product Studio</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    "Break down product feedback into actionable sprint-ready insights."
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-brand">
                    Updated Monday · New variations · Ready to deploy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
