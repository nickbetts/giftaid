const metrics = [
  { label: "Open uploads", value: "12", hint: "+3 since yesterday" },
  { label: "Ready claims", value: "8", hint: "2 waiting approval" },
  { label: "Submission confidence", value: "84", hint: "median score" },
  { label: "Projected Gift Aid", value: "GBP 248k", hint: "current cycle" },
];

const timeline = [
  "CSV upload completed for Spring Campaign",
  "AI assistant suggested 142 row-level fixes",
  "Validation policy set updated for HMRC year 2026-2027",
  "Two high-risk claims routed to manual review",
];

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-5 pb-20 pt-8 md:px-10">
      <section className="grid gap-6 rounded-3xl border border-teal-900/10 bg-white/90 p-8 shadow-lg shadow-teal-950/10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">Operations cockpit</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Charity claim operations at a glance
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            This workspace is the live command center for ingestion, validation, AI-assisted triage, and HMRC claim submission.
          </p>
        </div>
        <div className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand-deep to-brand p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-200">AI status</p>
          <p className="mt-3 text-2xl font-semibold">Guardrails enabled</p>
          <p className="mt-2 text-sm text-teal-100">
            Redaction, confidence thresholding, and audit logging are active for suggestion workflows.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white/85 p-5 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{metric.value}</p>
            <p className="mt-2 text-sm text-slate-600">{metric.hint}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/85 p-6 md:p-8">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Recent timeline</h2>
        <ul className="mt-4 grid gap-3">
          {timeline.map((item) => (
            <li key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
