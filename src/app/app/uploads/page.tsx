import { UploadWorkbench } from "@/components/uploads/upload-workbench";

export default function AppUploadsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <header className="rounded-3xl border border-slate-200 bg-white/85 p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">Donation uploads</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Validate and save donation files</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Drop or select your CSV file. givta checks every row, flags issues in plain English, and prepares the data for a claim.
        </p>
      </header>
      <UploadWorkbench />
    </div>
  );
}
