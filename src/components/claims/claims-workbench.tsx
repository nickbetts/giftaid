"use client";

import { useEffect, useState } from "react";

type UploadRecord = {
  id: string;
  fileName: string;
  status: string;
  rowCount: number;
  eligibleRowCount: number;
  claim: { id: string; claimReference: string; status: string } | null;
};

type ClaimRecord = {
  id: string;
  claimReference: string;
  status: string;
  confidenceScore: number | null;
  estimatedAidPence: number;
  taxYear: string;
  createdAt: string;
  submittedAt: string | null;
  hmrcSubmissionId: string | null;
  uploadFileName: string | null;
};

function formatCurrency(pence: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(pence / 100);
}

const statusColor: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  READY: "bg-emerald-100 text-emerald-700",
  REQUIRES_REVIEW: "bg-rose-100 text-rose-700",
  QUEUED: "bg-amber-100 text-amber-700",
  SUBMITTED: "bg-sky-100 text-sky-700",
  FAILED: "bg-rose-100 text-rose-700",
};

export function ClaimsWorkbench() {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [loadingUploadId, setLoadingUploadId] = useState<string | null>(null);
  const [submittingClaimId, setSubmittingClaimId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async () => {
    const [uploadsResponse, claimsResponse] = await Promise.all([
      fetch("/api/uploads", { cache: "no-store" }),
      fetch("/api/claims", { cache: "no-store" }),
    ]);

    const uploadsData = (await uploadsResponse.json()) as { uploads: UploadRecord[] };
    const claimsData = (await claimsResponse.json()) as { claims: ClaimRecord[] };

    setUploads(uploadsData.uploads);
    setClaims(claimsData.claims);
  };

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const [uploadsResponse, claimsResponse] = await Promise.all([
        fetch("/api/uploads", { cache: "no-store" }),
        fetch("/api/claims", { cache: "no-store" }),
      ]);

      const uploadsData = (await uploadsResponse.json()) as { uploads: UploadRecord[] };
      const claimsData = (await claimsResponse.json()) as { claims: ClaimRecord[] };

      if (!cancelled) {
        setUploads(uploadsData.uploads);
        setClaims(claimsData.claims);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const createClaim = async (uploadId: string) => {
    setLoadingUploadId(uploadId);
    setMessage(null);

    const response = await fetch("/api/claims/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId }),
    });

    const data = (await response.json()) as { error?: string; claim?: { claimReference: string } };
    setLoadingUploadId(null);
    setMessage(data.error ?? (data.claim ? `Created ${data.claim.claimReference}.` : null));
    await refresh();
  };

  const submitClaim = async (claimId: string) => {
    setSubmittingClaimId(claimId);
    setMessage(null);

    const response = await fetch("/api/claims/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "idempotency-key": crypto.randomUUID() },
      body: JSON.stringify({ claimId }),
    });

    const data = (await response.json()) as { error?: string; message?: string };
    setSubmittingClaimId(null);
    setMessage(data.error ?? data.message ?? null);
    await refresh();
  };

  const claimableUploads = uploads.filter((upload) => upload.status === "READY" && !upload.claim);

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Ready uploads</h2>
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand"
          >
            Refresh
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {claimableUploads.length === 0 ? (
            <p className="text-sm text-slate-600">No claim-ready uploads yet. Save a validated upload first.</p>
          ) : null}
          {claimableUploads.map((upload) => (
            <article key={upload.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{upload.fileName}</p>
                  <p className="text-sm text-slate-600">
                    {upload.rowCount} rows, {upload.eligibleRowCount} currently eligible
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void createClaim(upload.id)}
                  disabled={loadingUploadId === upload.id}
                  className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingUploadId === upload.id ? "Creating..." : "Create claim"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Claims queue</h2>
        {message ? <p className="mt-3 text-sm font-medium text-slate-700">{message}</p> : null}
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Claim ref</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Confidence</th>
                <th className="px-4 py-3 font-semibold">Estimated Gift Aid</th>
                <th className="px-4 py-3 font-semibold">Upload</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {claims.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-sm text-slate-600">
                    No claims created yet.
                  </td>
                </tr>
              ) : null}
              {claims.map((claim) => (
                <tr key={claim.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{claim.claimReference}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColor[claim.status] ?? statusColor.DRAFT}`}>
                      {claim.status.toLowerCase().replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{claim.confidenceScore ?? "-"}%</td>
                  <td className="px-4 py-3 text-slate-700">{formatCurrency(claim.estimatedAidPence)}</td>
                  <td className="px-4 py-3 text-slate-700">{claim.uploadFileName ?? "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void submitClaim(claim.id)}
                      disabled={claim.status !== "READY" || submittingClaimId === claim.id}
                      className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submittingClaimId === claim.id ? "Submitting..." : claim.status === "READY" ? "Submit" : "Waiting"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
