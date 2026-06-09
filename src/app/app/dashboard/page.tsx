import { prisma } from "@/lib/db";
import { formatCurrencyFromPence, formatDateTime } from "@/lib/format";
import { getOrCreateDefaultCharity } from "@/lib/server/default-charity";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AppDashboardPage() {
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

  const readyClaims = claims.filter((c) => c.status === "READY").length;
  const openUploads = uploads.filter((u) => u.status === "READY").length;
  const averageConfidence = claims.length
    ? Math.round(claims.reduce((sum, c) => sum + (c.confidenceScore ?? 0), 0) / claims.length)
    : 0;
  const projectedAid = claims.reduce((sum, c) => sum + c.estimatedAidPence, 0);

  const metrics = [
    { label: "Open uploads", value: String(openUploads), hint: `${uploads.length} saved` },
    { label: "Ready claims", value: String(readyClaims), hint: `${claims.length} total` },
    { label: "Avg confidence", value: `${averageConfidence}%`, hint: "Across current claims" },
    { label: "Projected Gift Aid", value: formatCurrencyFromPence(projectedAid), hint: "From created claims" },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8">
      <section className="grid gap-6 rounded-3xl border border-teal-900/10 bg-white/90 p-7 shadow-sm md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Claim operations at a glance
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
            Live numbers from your Neon database. As uploads and claims move through the system this updates automatically.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/app/uploads" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700">
              New upload
            </Link>
            <Link href="/app/claims" className="rounded-full border border-brand/40 bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:border-brand">
              View claims
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand-deep to-brand p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-200">Workspace status</p>
          <p className="mt-3 text-2xl font-semibold">Connected to Neon</p>
          <p className="mt-2 text-sm text-teal-100">
            Uploads, claims, and audit events are stored against your charity workspace in real time.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white/85 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{metric.value}</p>
            <p className="mt-1 text-sm text-slate-600">{metric.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white/85 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
          <ul className="mt-4 grid gap-2">
            {auditEvents.length === 0 ? (
              <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                No activity yet. Start with a donation upload.
              </li>
            ) : null}
            {auditEvents.map((event) => (
              <li key={event.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span className="font-medium capitalize">{event.eventType.replace(/_/g, " ").toLowerCase()}</span>
                <span className="block text-xs text-slate-500">{formatDateTime(event.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/85 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Latest uploads</h2>
          <ul className="mt-4 grid gap-2">
            {uploads.length === 0 ? (
              <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                No uploads saved yet.
              </li>
            ) : null}
            {uploads.map((upload) => (
              <li key={upload.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span className="font-medium">{upload.fileName}</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {upload.rowCount} rows &middot; {upload.rows.filter((r) => r.eligible !== false).length} eligible &middot; {upload.status.toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
