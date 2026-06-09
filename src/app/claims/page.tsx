import { ClaimsWorkbench } from "@/components/claims/claims-workbench";

export default function ClaimsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-20 pt-8 md:px-10">
      <header className="rounded-3xl border border-slate-200 bg-white/85 p-7 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">Claim command center</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Create and submit claims from live uploads</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          This workspace now reads from Neon. Create claims from saved uploads, review confidence, and submit ready items through the first HMRC adapter stub.
        </p>
      </header>
      <ClaimsWorkbench />
    </main>
  );
}
