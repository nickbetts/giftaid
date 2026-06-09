import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

const outcomes = [
  {
    title: "Less admin",
    body: "Upload the data you already have and let givta sort the checks, the tidy-up, and the claim prep.",
  },
  {
    title: "More money back",
    body: "Spot missed Gift Aid, fix common errors early, and turn more eligible donations into income for your cause.",
  },
  {
    title: "A calmer process",
    body: "Every step is explained in plain English so your team knows what to do next and why it matters.",
  },
  {
    title: "Clear pricing",
    body: "Just 3% flat commission, only when claims are processed. No big setup costs and no confusing extras.",
  },
];

const proofPoints = [
  { label: "Flat commission", value: "3%" },
  { label: "Typical time saved", value: "Hours every claim" },
  { label: "Support style", value: "Plain English" },
];

const steps = [
  {
    title: "Send your file",
    body: "Upload your donation data from the system you already use. CSV and ODS both work.",
    illustration: "/undraw_drag-to-add_8zdg.svg",
  },
  {
    title: "Fix the easy wins",
    body: "givta checks the data, flags issues, and explains what needs changing in simple language.",
    illustration: "/undraw_file-searching_yska.svg",
  },
  {
    title: "Claim with confidence",
    body: "Approve the final claim, send it on, and keep a clean record of everything in one place.",
    illustration: "/undraw_document-ready_o5d5.svg",
  },
];

const faqs = [
  {
    question: "Do we need to change how we record donations?",
    answer: "No. Start with the files you already export today and we will guide you from there.",
  },
  {
    question: "Is givta only for large charities?",
    answer: "No. It is designed to be clear and useful for small teams as well as larger finance functions.",
  },
  {
    question: "When do we pay?",
    answer: "The public offer is a 3% flat commission on processed claims, so the cost stays tied to results.",
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
                Built for UK charities that want Gift Aid to feel easy
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
                More Gift Aid. Less admin. A lot less hassle.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted">
                givta helps busy charity teams clean up donation data, submit claims with confidence, and keep more money flowing to the work that matters.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/charity"
                  className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  See how givta works
                </Link>
                <Link
                  href="/upload"
                  className="rounded-full border border-brand/40 bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:border-brand"
                >
                  Try a free file check
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-brand/20 bg-brand-deep p-6 text-white shadow-lg shadow-brand-deep/30">
              <Image src="/givta.svg" alt="givta logo" width={200} height={109} className="h-auto w-36" priority />
              <Image src="/undraw_gift-joy_kqz4.svg" alt="" width={220} height={145} className="mt-5 h-32 w-auto opacity-90" aria-hidden />
              <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-teal-200">Why teams switch</p>
              <p className="mt-3 text-2xl font-semibold">They stop wrestling spreadsheets and start recovering income faster.</p>
              <p className="mt-3 text-sm leading-6 text-teal-100">
                givta keeps the process warm, simple, and well organised so finance and fundraising teams can work together without confusion.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {outcomes.map((outcome) => (
            <article key={outcome.title} className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">{outcome.title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-700">{outcome.body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-8 backdrop-blur md:p-10">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">The promise is simple</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            givta helps you save staff time, cut down on claim stress, and recover more eligible Gift Aid without adding another complicated system.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {proofPoints.map((point) => (
              <article key={point.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-2xl font-semibold text-slate-900">{point.value}</p>
                <p className="mt-1 text-sm text-slate-600">{point.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white/85 p-8 md:grid-cols-[0.85fr_1.15fr] md:p-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">How it works</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
              You do not need a long setup project. Most teams can understand the flow in minutes because each stage is clear and practical.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <Image src={step.illustration} alt="" width={120} height={80} className="h-20 w-auto" aria-hidden />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-brand">0{index + 1}</p>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl border border-slate-200 bg-brand-deep p-8 text-white md:grid-cols-[1.1fr_0.9fr] md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-200">Straightforward pricing</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Just 3% flat commission</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-teal-50/90">
              We only make money when claims are processed. That keeps the offer simple and keeps our focus on helping your charity recover more.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/8 p-6">
            <Image src="/undraw_budgeting_klon.svg" alt="" width={180} height={120} className="mb-5 h-28 w-auto opacity-90" aria-hidden />
            <p className="text-sm leading-7 text-teal-50/90">
              Good for teams that want to save time, avoid missed claims, and stop spending days chasing down data problems.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/charity/claim" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-deep transition hover:bg-teal-50">
                View pricing and process
              </Link>
              <Link href="/upload" className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Check a file first
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white/85 p-8 md:p-10">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Questions charities ask us</h2>
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
