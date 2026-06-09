import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

const steps = [
  {
    title: "Complete the readiness check",
    body: "Answer a short questionnaire so we can tailor setup to your team and data sources.",
  },
  {
    title: "Register your charity",
    body: "Create your account, assign roles, and connect your claim operations workspace.",
  },
  {
    title: "Upload donation records",
    body: "Submit your file securely. We validate and highlight any rows that need attention.",
  },
  {
    title: "Approve and submit",
    body: "Review your claim summary, approve with confidence, and submit to HMRC through one clear flow.",
  },
];

const benefits = [
  "Warm, guided onboarding for finance and fundraising teams",
  "Clear explanations when records need correction",
  "Claim confidence scoring before you submit",
  "Full audit timeline for every claim",
  "Friendly support experience built into the product",
];

export default function CharityPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-12 px-5 pb-20 pt-8 md:px-10">
        <section className="rounded-3xl border border-teal-900/10 bg-white/90 p-8 shadow-lg shadow-teal-950/10 md:p-12">
          <p className="inline-flex rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
            For charities
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
            Recover more Gift Aid with a process your whole team can trust
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            We designed this around real charity workflows. It is straightforward, supportive, and focused on helping your team move from file upload to claim submission without stress.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/charity/claim" className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
              View claim submission flow
            </Link>
            <Link href="/upload" className="rounded-full border border-brand/40 bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:border-brand">
              Try upload preflight
            </Link>
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
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Why charity teams choose this approach</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Everything is built around clarity and reassurance so your colleagues can act quickly and feel confident about what happens next.
            </p>
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
