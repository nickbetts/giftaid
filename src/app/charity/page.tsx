import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

const steps = [
  {
    title: "Start with the data you already have",
    body: "There is no need to rebuild your process from scratch. Export your current file and begin there.",
  },
  {
    title: "See what needs attention",
    body: "givta highlights the records that need work and explains the fix in a way non specialists can follow.",
  },
  {
    title: "Approve the final claim",
    body: "Your team stays in control and reviews the summary before anything is sent.",
  },
  {
    title: "Keep every record tidy",
    body: "Track what happened, when it happened, and who approved it without chasing notes in email chains.",
  },
];

const benefits = [
  "A simple path your finance and fundraising teams can both understand",
  "Fewer spreadsheet headaches and less back and forth before a claim goes in",
  "A calmer process for busy teams that do not have hours to spare",
  "Clear records for trustees, audits, and internal checks",
  "A 3% flat commission that stays tied to results",
];

export default function CharityPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-12 px-5 pb-20 pt-8 md:px-10">
        <section className="grid gap-8 rounded-3xl border border-teal-900/10 bg-white/90 p-8 shadow-lg shadow-teal-950/10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:p-12">
          <div>
            <p className="inline-flex rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
              For charity teams
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
              Give your team a simpler way to recover Gift Aid
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              givta is built for the real pain points. Too much admin, too many spreadsheets, and too much time spent fixing avoidable claim issues.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/charity/claim" className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
                See pricing and claim flow
              </Link>
              <Link href="/upload" className="rounded-full border border-brand/40 bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:border-brand">
                Try a free file check
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Image src="/undraw_certification_oqiz.svg" alt="" width={320} height={240} className="h-auto w-full max-w-[260px]" aria-hidden />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-slate-200 bg-white/85 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand">Step {index + 1}</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">{step.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{step.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 rounded-3xl border border-slate-200 bg-white/85 p-8 md:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Why charities move to givta</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The goal is not to give you another technical system to learn. The goal is to help your team claim more and worry less.
            </p>
            <Image src="/undraw_security-on_3ykb.svg" alt="" width={200} height={130} className="mt-6 h-32 w-auto" aria-hidden />
          </div>
          <ul className="grid gap-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {benefit}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
