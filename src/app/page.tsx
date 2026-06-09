import Link from "next/link";

const pillars = [
  {
    title: "Ingest",
    body: "Upload CSV or ODS files, map data in minutes, and fix schema issues before they become claim failures.",
  },
  {
    title: "Validate",
    body: "Deterministic checks plus AI explanations show why each row is eligible, ineligible, or needs review.",
  },
  {
    title: "Submit",
    body: "Route approved claims through an idempotent HMRC submission pipeline with full timeline evidence.",
  },
  {
    title: "Learn",
    body: "Track quality drift, rejection patterns, and estimated recovery upside with AI-powered recommendations.",
  },
];

const aiFeatures = [
  "Upload repair assistant",
  "Eligibility explainer with policy references",
  "Claim risk and confidence score",
  "Natural language analytics Q and A",
  "Donor communication drafting",
  "Operations copilot for support",
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-16 px-5 pb-20 pt-8 md:px-10">
      <section className="relative overflow-hidden rounded-3xl border border-teal-900/10 bg-surface/90 p-8 shadow-xl shadow-teal-950/10 md:p-12">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-300/35 blur-3xl" />
        <div className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-emerald-300/35 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
            GiftAid OS
            <span className="rounded-full bg-brand px-2 py-0.5 text-xs text-white">AI</span>
          </div>
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
            <div className="space-y-5">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
                Claim Gift Aid faster with less admin and stronger confidence.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted">
                We are building an AI-first workflow for charity finance teams to ingest donation data, resolve
                eligibility issues, and submit HMRC claims with full audit evidence.
              </p>
            </div>
            <div className="rounded-2xl border border-brand/20 bg-brand-deep p-6 text-white shadow-lg shadow-brand-deep/30">
              <p className="text-sm font-semibold uppercase tracking-wider text-teal-200">Active implementation</p>
              <p className="mt-3 text-2xl font-semibold">Foundation sprint in progress</p>
              <p className="mt-3 text-sm leading-6 text-teal-100">
                Next.js 16, Vercel-ready architecture, claim ingestion APIs, and AI copilots are being wired from day one.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Open product dashboard
            </Link>
            <Link
              href="/upload"
              className="rounded-full border border-brand/40 bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:border-brand"
            >
              Try upload preflight
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">{pillar.title}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{pillar.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white/80 p-8 backdrop-blur md:grid-cols-[1fr_1.1fr] md:p-10">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">AI features under implementation</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Every suggestion is backed by deterministic validation and logged with confidence scoring for traceability.
          </p>
          <Link
            href="/claims"
            className="mt-6 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-brand hover:text-brand"
          >
            View claim command center
          </Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {aiFeatures.map((feature) => (
            <li
              key={feature}
              className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-teal-50 px-4 py-3 text-sm font-medium text-slate-700"
            >
              {feature}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
