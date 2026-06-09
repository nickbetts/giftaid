import { UploadWorkbench } from "@/components/uploads/upload-workbench";

export default function UploadPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-20 pt-8 md:px-10">
      <header className="rounded-3xl border border-slate-200 bg-white/85 p-7">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">Donation uploads</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Validate, store, and review donation files</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Paste a CSV export from your fundraising system, save it to the live workspace, and see whether it is ready to become a claim.
        </p>
      </header>
      <UploadWorkbench />
    </main>
  );
}
