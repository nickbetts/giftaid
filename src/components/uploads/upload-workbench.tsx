"use client";

import { useEffect, useState } from "react";

type UploadRecord = {
  id: string;
  fileName: string;
  sourceSystem: string | null;
  status: string;
  rowCount: number;
  parseErrors: string[];
  createdAt: string;
  eligibleRowCount: number;
  claim: { id: string; claimReference: string; status: string } | null;
};

type UploadResponse = {
  upload: {
    id: string;
    fileName: string;
    status: string;
    rowCount: number;
    sourceSystem: string | null;
    createdAt: string;
  };
  summary: {
    rowCount: number;
    confidenceScore: number;
    riskBand: "low" | "medium" | "high";
    warnings: Array<{ code: string; message: string; severity: "low" | "medium" | "high" }>;
    eligibleRowCount: number;
    parseErrors: string[];
  };
};

const sampleCsv = `donationReference,donationDate,grossAmount,donorFirstName,donorLastName,donorPostcode,donorHouseNameOrNumber
DON-1001,2026-05-01,25.00,Alice,Smith,SW1A 1AA,10
DON-1002,2026-05-03,40.00,David,Jones,BS1 4DJ,22
DON-1003,2026-05-07,18.50,Rachel,Taylor,LS1 2AB,4A`;

export function UploadWorkbench() {
  const [fileName, setFileName] = useState("spring-appeal.csv");
  const [sourceSystem, setSourceSystem] = useState("Fundraising CRM");
  const [csvText, setCsvText] = useState(sampleCsv);
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadUploads = async () => {
    const response = await fetch("/api/uploads", { cache: "no-store" });
    const data = (await response.json()) as { uploads: UploadRecord[] };
    setUploads(data.uploads);
  };

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const response = await fetch("/api/uploads", { cache: "no-store" });
      const data = (await response.json()) as { uploads: UploadRecord[] };

      if (!cancelled) {
        setUploads(data.uploads);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const submitUpload = async () => {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, sourceSystem, csvText }),
    });

    const data = (await response.json()) as UploadResponse | { error: string };

    if (!response.ok) {
      setError("error" in data ? data.error : "Upload failed.");
      setLoading(false);
      await loadUploads();
      return;
    }

    setResult(data as UploadResponse);
    setLoading(false);
    await loadUploads();
  };

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          File name
          <input
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-brand"
            value={fileName}
            onChange={(event) => setFileName(event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Source system
          <input
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-brand"
            value={sourceSystem}
            onChange={(event) => setSourceSystem(event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
          Donation file content
          <textarea
            className="min-h-72 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-800 outline-none transition focus:ring-2 focus:ring-brand"
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
          />
        </label>
        <div className="md:col-span-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={submitUpload}
            disabled={loading}
            className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Processing upload..." : "Validate and save upload"}
          </button>
          <button
            type="button"
            onClick={() => setCsvText(sampleCsv)}
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand"
          >
            Reset sample template
          </button>
        </div>
        {error ? <p className="md:col-span-2 text-sm font-medium text-rose-700">{error}</p> : null}
      </section>

      {result ? (
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Latest upload summary</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rows parsed</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{result.summary.rowCount}</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Eligible rows</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{result.summary.eligibleRowCount}</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Confidence</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{result.summary.confidenceScore}%</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Risk band</p>
              <p className="mt-2 text-2xl font-semibold capitalize text-slate-900">{result.summary.riskBand}</p>
            </article>
          </div>
          <ul className="mt-4 grid gap-2">
            {result.summary.warnings.map((warning) => (
              <li key={warning.code} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span className="font-semibold">{warning.code}</span>: {warning.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Recent uploads</h2>
          <button
            type="button"
            onClick={() => void loadUploads()}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand"
          >
            Refresh
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {uploads.length === 0 ? (
            <p className="text-sm text-slate-600">No uploads yet. Start by validating and saving a donation file.</p>
          ) : null}
          {uploads.map((upload) => (
            <article key={upload.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">{upload.fileName}</p>
                  <p className="mt-1 text-sm text-slate-600">{upload.sourceSystem ?? "Unknown source"}</p>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <p className="capitalize">{upload.status.toLowerCase()}</p>
                  <p>{new Date(upload.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-700">
                <span>{upload.rowCount} rows</span>
                <span>{upload.eligibleRowCount} eligible</span>
                <span>{upload.parseErrors.length} parse issues</span>
                <span>{upload.claim ? `Claim ${upload.claim.claimReference}` : "No claim yet"}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
