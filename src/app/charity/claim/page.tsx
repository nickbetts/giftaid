import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

const flow = [
  {
    title: "Create your givta workspace",
    body: "Get your charity set up and decide who should review and approve claims.",
    illustration: "/undraw_app-benchmarks_ls0m.svg",
  },
  {
    title: "Use the simple template",
    body: "If you need it, download a clean template that makes common errors less likely.",
    illustration: null,
  },
  {
    title: "Upload your donation file",
    body: "Send through CSV or ODS records securely and let givta run the first checks.",
    illustration: "/undraw_drag-to-add_8zdg.svg",
  },
  {
    title: "Fix what matters",
    body: "We highlight ineligible rows and explain the changes in a way your team can act on quickly.",
    illustration: "/undraw_file-search_cbur.svg",
  },
  {
    title: "Submit to HMRC",
    body: "Approved claims move through one clear submission flow with tracking you can follow.",
    illustration: "/undraw_successful-upload_t9fz.svg",
  },
  {
    title: "Keep a clean record",
    body: "See what was sent, what changed, and what came back without piecing together separate tools.",
    illustration: null,
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
              Claims made simple
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              A clear path from donation file to submitted claim
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              No confusing handoffs and no mystery steps. givta keeps the whole process organised so your team can move faster with less stress.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/upload" className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
                Start with a free file check
              </Link>
              <Link href="/claims" className="rounded-full border border-brand/40 bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:border-brand">
                Open the claim workspace
              </Link>
            </div>
          </div>
          <aside className="rounded-2xl border border-brand/20 bg-brand-deep p-6 text-white">
            <Image src="/undraw_document-ready_o5d5.svg" alt="" width={200} height={130} className="mb-4 h-28 w-auto opacity-90" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-200">Simple pricing</p>
            <p className="mt-3 text-3xl font-semibold">3% flat commission</p>
            <p className="mt-2 text-sm text-teal-100">A low, clear rate tied to processed claims so you keep more of the income you recover.</p>
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {flow.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-slate-200 bg-white/85 p-5">
              {step.illustration ? (
                <Image src={step.illustration} alt="" width={100} height={70} className="mb-3 h-16 w-auto" aria-hidden />
              ) : null}
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
