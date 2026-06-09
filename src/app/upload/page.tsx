import Image from "next/image";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { FreeCheck } from "@/components/uploads/free-check";

const stats = [
  { value: "25p", label: "back for every £1 donated by a UK taxpayer" },
  { value: "Weeks", label: "not months — typical time from file to claim" },
  { value: "3%", label: "flat commission, only when claims are processed" },
];

export default function FreeCheckPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-5 pb-20 pt-8 md:px-10">
        <section className="relative overflow-hidden rounded-3xl border border-teal-900/10 bg-surface/90 p-8 shadow-xl shadow-teal-950/10 md:p-12">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-300/30 blur-3xl" />
          <div className="absolute -bottom-16 left-8 h-48 w-48 rounded-full bg-emerald-300/30 blur-3xl" />
          <div className="relative z-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
                Free file check
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                Drop in your donation file and see what Gift Aid you could claim
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted">
                No sign up needed. givta checks your first 5 rows instantly and shows you how much your full file could recover.
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <Image src="/undraw_drag-to-add_8zdg.svg" alt="" width={260} height={180} className="h-44 w-auto" aria-hidden />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 text-center shadow-sm backdrop-blur">
              <p className="text-3xl font-semibold text-brand">{stat.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{stat.label}</p>
            </article>
          ))}
        </section>

        <FreeCheck />
      </main>
      <SiteFooter />
    </div>
  );
}
