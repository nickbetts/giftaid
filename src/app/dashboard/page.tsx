import { prisma } from "@/lib/db";
import { formatCurrencyFromPence, formatDateTime } from "@/lib/format";
import { getOrCreateDefaultCharity } from "@/lib/server/default-charity";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const charity = await getOrCreateDefaultCharity();

  const [uploads, claims, auditEvents] = await Promise.all([
    prisma.donationUpload.findMany({
      where: { charityId: charity.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { rows: { select: { eligible: true } } },
    }),
    prisma.claim.findMany({
      where: { charityId: charity.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.auditEvent.findMany({
      where: { charityId: charity.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const readyClaims = claims.filter((claim) => claim.status === "READY").length;
  const openUploads = uploads.filter((upload) => upload.status === "READY").length;
  const averageConfidence = claims.length
    ? Math.round(claims.reduce((sum, claim) => sum + (claim.confidenceScore ?? 0), 0) / claims.length)
    : 0;
  const projectedAid = claims.reduce((sum, claim) => sum + claim.estimatedAidPence, 0);

  const metrics = [
    { label: "Open uploads", value: String(openUploads), hint: `${uploads.length} saved in workspace` },
    { label: "Ready claims", value: String(readyClaims), hint: `${claims.length} total claims created` },
    { label: "Submission confidence", value: `${averageConfidence}%`, hint: "Average across current claims" },
    { label: "Projected Gift Aid", value: formatCurrencyFromPence(projectedAid), hint: "Estimated from created claims" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-5 pb-20 pt-8 md:px-10">
      <section className="grid gap-6 rounded-3xl border border-teal-900/10 bg-white/90 p-8 shadow-lg shadow-teal-950/10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">Operations cockpit</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Charity claim operations at a glance
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            These numbers now come from your live Neon database. As uploads and claims move through the system, this dashboard updates with real activity.
          </p>
        </div>
        <div className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand-deep to-brand p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-200">Workspace status</p>
          <p className="mt-3 text-2xl font-semibold">Connected to Neon</p>
          <p className="mt-2 text-sm text-teal-100">
            Uploads, claims, and audit events are now being stored against your charity workspace.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white/85 p-5 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{metric.value}</p>
            <p className="mt-2 text-sm text-slate-600">{metric.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 md:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Recent activity</h2>
          <ul className="mt-4 grid gap-3">
            {auditEvents.length === 0 ? (
              <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                No activity yet. Start with a donation upload to populate the workspace.
              </li>
            ) : null}
            {auditEvents.map((event) => (
              <li key={event.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span className="font-semibold">{event.eventType.replace(/_/g, " ").toLowerCase()}</span>
                <span className="block text-slate-500">{formatDateTime(event.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 md:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Latest uploads</h2>
          <ul className="mt-4 grid gap-3">
            {uploads.length === 0 ? (
              <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                No uploads saved yet.
              </li>
            ) : null}
            {uploads.map((upload) => (
              <li key={upload.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span className="font-semibold">{upload.fileName}</span>
                <span className="block text-slate-500">
                  {upload.rowCount} rows, {upload.rows.filter((row) => row.eligible !== false).length} eligible, {upload.status.toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
