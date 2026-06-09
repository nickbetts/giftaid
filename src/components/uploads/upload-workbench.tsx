"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

type GuidanceResponse = {
  summary: string;
  nextSteps: string[];
  donorDataAdvice: string[];
  confidenceNote: string;
  model: string;
};

const sampleCsv = `donationReference,donationDate,grossAmount,donorFirstName,donorLastName,donorPostcode,donorHouseNameOrNumber
DON-1001,2026-05-01,25.00,Alice,Smith,SW1A 1AA,10
DON-1002,2026-05-03,40.00,David,Jones,BS1 4DJ,22
DON-1003,2026-05-07,18.50,Rachel,Taylor,LS1 2AB,4A`;

function confidenceLabel(score: number) {
  if (score >= 80) return "High";
  if (score >= 50) return "Good";
  return "Needs work";
}

export function UploadWorkbench() {
  const [dragActive, setDragActive] = useState(false);
  const [sourceSystem, setSourceSystem] = useState("Fundraising CRM");
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [guidance, setGuidance] = useState<GuidanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      if (!cancelled) setUploads(data.uploads);
    };
    void bootstrap();
    return () => { cancelled = true; };
  }, []);

  const loadGuidance = useCallback(async (uploadResult: UploadResponse) => {
    setGuidanceLoading(true);
    setError(null);
    const response = await fetch("/api/ai/upload-guidance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: uploadResult.upload.fileName,
        sourceSystem: uploadResult.upload.sourceSystem,
        ...uploadResult.summary,
      }),
    });
    const data = (await response.json()) as GuidanceResponse | { error: string };
    if (!response.ok) {
      setError("error" in data ? data.error : "Unable to load guidance.");
    } else {
      setGuidance(data as GuidanceResponse);
    }
    setGuidanceLoading(false);
  }, []);

  const submitUpload = useCallback(async (text: string, name: string) => {
    setLoading(true);
    setError(null);
    setGuidance(null);
    setResult(null);

    const response = await fetch("/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: name, sourceSystem, csvText: text }),
    });

    const data = (await response.json()) as UploadResponse | { error: string };
    await loadUploads();

    if (!response.ok) {
      setError("error" in data ? data.error : "Upload failed.");
      setLoading(false);
      return;
    }

    const uploadResult = data as UploadResponse;
    setResult(uploadResult);
    setLoading(false);
    void loadGuidance(uploadResult);
  }, [sourceSystem, loadGuidance]);

  const handleFile = useCallback(async (file: File) => {
    const text = await file.text();
    await submitUpload(text, file.name);
  }, [submitUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }, [handleFile]);

  return (
    <div className="grid gap-6">
      {/* Drop zone */}
      {!result ? (
        <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Source system (CRM or fundraising platform name)
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-brand"
              value={sourceSystem}
              onChange={(e) => setSourceSystem(e.target.value)}
            />
          </label>

          <div
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex min-h-56 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 text-center transition ${
              dragActive
                ? "border-brand bg-brand/5"
                : "border-slate-300 bg-slate-50 hover:border-brand/60 hover:bg-brand/5"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileInput}
            />
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
                <p className="text-sm font-medium text-slate-600">Uploading and validating…</p>
              </div>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <svg className="h-6 w-6 text-brand" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16v2a2 2 0 002 2h14a2 2 0 002-2v-2M16 8l-4-4-4 4M12 4v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {dragActive ? "Drop to start validating" : "Drop your CSV here or click to browse"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">givta checks every row and prepares a claim automatically</p>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([sampleCsv], { type: "text/csv" });
                const fakeFile = new File([blob], "sample-donations.csv", { type: "text/csv" });
                void handleFile(fakeFile);
              }}
              disabled={loading}
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand disabled:opacity-60"
            >
              Try with sample data
            </button>
          </div>

          {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
        </section>
      ) : null}

      {result ? (
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{result.upload.fileName}</h2>
              <p className="text-sm text-slate-500">{result.upload.sourceSystem ?? "Unknown source"}</p>
            </div>
            <button
              type="button"
              onClick={() => { setResult(null); setGuidance(null); }}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand"
            >
              Upload another file
            </button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rows checked</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{result.summary.rowCount}</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Eligible donations</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{result.summary.eligibleRowCount}</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Confidence</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{confidenceLabel(result.summary.confidenceScore)}</p>
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

          {guidanceLoading ? (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
              <p className="text-sm text-slate-600">Preparing personalised guidance…</p>
            </div>
          ) : null}

          {guidance ? (
            <div className="mt-6 grid gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Suggested next steps</h3>
                <p className="mt-2 text-sm leading-7 text-slate-700">{guidance.summary}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">What to do next</p>
                  <ul className="mt-2 grid gap-2">
                    {guidance.nextSteps.map((item) => (
                      <li key={item} className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Donor data checks</p>
                  <ul className="mt-2 grid gap-2">
                    {guidance.donorDataAdvice.map((item) => (
                      <li key={item} className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-sm text-slate-700">{guidance.confidenceNote}</p>
            </div>
          ) : null}
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
