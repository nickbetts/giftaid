import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

const flow = [
  {
    title: "Register your team",
    body: "Set up your charity workspace and choose who can approve submissions.",
  },
  {
    title: "Download the template",
    body: "Use the standard format to avoid avoidable errors and speed up checks.",
  },
  {
    title: "Upload your donation file",
    body: "Submit CSV or ODS records through a secure upload process.",
  },
  {
    title: "Run data checks",
    body: "We highlight ineligible rows and suggest simple fixes in plain language.",
  },
  {
    title: "Submit to HMRC",
    body: "Approved claims are queued and submitted with idempotent tracking.",
  },
  {
    title: "Track outcomes",
    body: "Follow status updates and keep complete evidence for internal review.",
  },
];

export default function ClaimPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-12 px-5 pb-20 pt-8 md:px-10">
        <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white/90 p-8 md:grid-cols-[1.2fr_1fr] md:p-12">
          <div>
            <p className="inline-flex rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
              Claim submissions
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              A clearer claim submission journey from start to finish
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              No confusing handoffs. No hidden steps. Your team can follow one guided path from file prep to final submission.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/upload" className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
                Open upload preflight
              </Link>
              <Link href="/claims" className="rounded-full border border-brand/40 bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:border-brand">
                Open command center
              </Link>
            </div>
          </div>
          <aside className="rounded-2xl border border-brand/20 bg-brand-deep p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-200">Success based pricing model</p>
            <p className="mt-3 text-3xl font-semibold">5% + VAT</p>
            <p className="mt-2 text-sm text-teal-100">Applied to processed Gift Aid so costs stay aligned with outcomes.</p>
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {flow.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-slate-200 bg-white/85 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand">Step {index + 1}</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">{step.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{step.body}</p>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
