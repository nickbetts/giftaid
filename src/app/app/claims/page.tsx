import { ClaimsWorkbench } from "@/components/claims/claims-workbench";

export default function AppClaimsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <header className="rounded-3xl border border-slate-200 bg-white/85 p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">Claim workspace</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Create and submit claims</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Create claims from validated uploads, review each item for confidence, and submit ready claims through the HMRC flow.
        </p>
      </header>
      <ClaimsWorkbench />
    </div>
  );
}
