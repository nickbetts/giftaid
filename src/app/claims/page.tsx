type ClaimRowStatus = "queued" | "manual-review" | "ready";

type ClaimRow = {
  claimReference: string;
  status: ClaimRowStatus;
  confidence: number;
  amount: string;
};

const queue: ClaimRow[] = [
  {
    claimReference: "GGAH-2027-041",
    status: "queued",
    confidence: 88,
    amount: "GBP 38,204",
  },
  {
    claimReference: "GGAH-2027-042",
    status: "manual-review",
    confidence: 57,
    amount: "GBP 12,942",
  },
  {
    claimReference: "GGAH-2027-043",
    status: "ready",
    confidence: 91,
    amount: "GBP 44,110",
  },
];

const statusColor: Record<ClaimRowStatus, string> = {
  queued: "bg-amber-100 text-amber-700",
  "manual-review": "bg-rose-100 text-rose-700",
  ready: "bg-emerald-100 text-emerald-700",
};

export default function ClaimsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-20 pt-8 md:px-10">
      <header className="rounded-3xl border border-slate-200 bg-white/85 p-7 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">Claim command center</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Submission queue and risk view</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Use this screen to track every claim from preparation to HMRC response with confidence scoring and review routing.
        </p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Claim ref</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Confidence</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((row) => (
              <tr key={row.claimReference} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{row.claimReference}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColor[row.status]}`}>{row.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-700">{row.confidence}%</td>
                <td className="px-4 py-3 text-slate-700">{row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
