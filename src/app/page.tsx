import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

const pillars = [
  {
    title: "Simple onboarding",
    body: "Get your team set up quickly with a guided checklist and clear support at every step.",
  },
  {
    title: "Cleaner submissions",
    body: "We check your file before submission so issues are spotted early and easier to fix.",
  },
  {
    title: "Trusted compliance",
    body: "Every important action is recorded to help your team stay audit-ready and confident.",
  },
  {
    title: "More time for your mission",
    body: "Less admin work means your staff can focus on fundraising, services, and impact.",
  },
];

const stats = [
  { label: "Average prep time saved", value: "38%" },
  { label: "Rows auto-corrected", value: "12,400" },
  { label: "Claims tracked end to end", value: "100%" },
];

const faqs = [
  {
    question: "Can we submit files from our existing finance process?",
    answer: "Yes. You can upload CSV or ODS files from your current system and we guide you through any fixes.",
  },
  {
    question: "Do we still stay in control of claims?",
    answer: "Absolutely. Your team approves submissions and can review every claim before it is sent.",
  },
  {
    question: "Will this work for a small charity team?",
    answer: "Yes. The experience is designed to be clear and friendly even for teams with limited time and capacity.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-14 px-5 pb-20 pt-8 md:px-10">
        <section className="relative overflow-hidden rounded-3xl border border-teal-900/10 bg-surface/90 p-8 shadow-xl shadow-teal-950/10 md:p-12">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-300/35 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-emerald-300/35 blur-3xl" />
          <div className="relative z-10 grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-end">
            <div className="space-y-5">
              <p className="inline-flex w-fit rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
                Built for UK charities
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
                A kinder, simpler way to claim Gift Aid
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted">
                GiftAid OS helps your team turn donation records into claim-ready submissions with less admin work and more confidence.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/charity"
                  className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Learn how it works
                </Link>
                <Link
                  href="/charity/claim"
                  className="rounded-full border border-brand/40 bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:border-brand"
                >
                  Explore claim submissions
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-brand/20 bg-brand-deep p-6 text-white shadow-lg shadow-brand-deep/30">
              <p className="text-sm font-semibold uppercase tracking-wider text-teal-200">What teams tell us</p>
              <p className="mt-3 text-2xl font-semibold">&ldquo;This feels clear and calm from day one.&rdquo;</p>
              <p className="mt-3 text-sm leading-6 text-teal-100">
                We focus on plain language, guided actions, and warm support so every team member can use the system with confidence.
              </p>
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

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-8 backdrop-blur md:p-10">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">See your potential uplift</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            If your charity has 2,500 eligible donations with an average value of GBP 20, the current cycle estimate is around GBP 12,500 in potential Gift Aid recovery.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white/85 p-8 md:p-10">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Frequently asked questions</h2>
          <div className="grid gap-3">
            {faqs.map((faq) => (
              <article key={faq.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-base font-semibold text-slate-900">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-700">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
