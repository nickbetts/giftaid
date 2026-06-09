"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

type CheckRow = {
  reference: string;
  grossAmountPence: number;
  eligible: boolean;
  issues: Array<{ code: string; message: string; severity: string }>;
};

type CheckResult = {
  summary: {
    rowCount: number;
    eligibleRowCount: number;
    confidenceScore: number;
    riskBand: "low" | "medium" | "high";
    warnings: Array<{ code: string; message: string; severity: "low" | "medium" | "high" }>;
    parseErrors: string[];
  };
  rows: CheckRow[];
  totalRowCount: number;
};

function confidenceLabel(score: number) {
  if (score >= 80) return { label: "High", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  if (score >= 50) return { label: "Good", color: "text-amber-700 bg-amber-50 border-amber-200" };
  return { label: "Needs work", color: "text-rose-700 bg-rose-50 border-rose-200" };
}

function formatPounds(pence: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(
    pence / 100,
  );
}

function estimateFullFileGiftAid(result: CheckResult): number {
  const { eligibleRowCount, rowCount } = result.summary;
  if (rowCount === 0 || result.totalRowCount === 0) return 0;

  const eligibleRows = result.rows.filter((r) => r.eligible);
  const avgGrossPence =
    eligibleRows.length > 0
      ? eligibleRows.reduce((s, r) => s + r.grossAmountPence, 0) / eligibleRows.length
      : 2000; // default £20

  const estimatedEligible = (eligibleRowCount / rowCount) * result.totalRowCount;
  return Math.round(estimatedEligible * avgGrossPence * 0.25);
}

export function FreeCheck() {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [odsWarning, setOdsWarning] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (file.name.toLowerCase().endsWith(".ods")) {
      setOdsWarning(true);
      return;
    }

    setOdsWarning(false);
    setError(null);
    setResult(null);
    setLoading(true);
    setFileName(file.name);

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const totalRowCount = Math.max(0, lines.length - 1); // exclude header row
    const limitedCsv = lines.slice(0, 6).join("\n"); // header + first 5 data rows

    const response = await fetch("/api/free-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csvText: limitedCsv, totalRowCount }),
    });

    const data = (await response.json()) as CheckResult | { error: string };

    if (!response.ok || "error" in data) {
      setError("error" in data ? data.error : "Could not process the file.");
      setLoading(false);
      return;
    }

    setResult(data as CheckResult);
    setLoading(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) void processFile(file);
    },
    [processFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void processFile(file);
    },
    [processFile],
  );

  const confidence = result ? confidenceLabel(result.summary.confidenceScore) : null;
  const estimatedAid = result ? estimateFullFileGiftAid(result) : 0;
  const hasMoreRows = result && result.totalRowCount > result.summary.rowCount;

  return (
    <div className="grid gap-6">
      {/* Drop zone */}
      {!result ? (
        <div
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex min-h-56 cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-10 text-center transition ${
            dragActive
              ? "border-brand bg-brand/5"
              : "border-slate-300 bg-white/80 hover:border-brand/60 hover:bg-brand/5"
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
              <p className="text-sm font-medium text-slate-600">Checking your file…</p>
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
                  {dragActive ? "Drop to check your file" : "Drop your CSV here or click to browse"}
                </p>
                <p className="mt-1 text-sm text-slate-500">We check the first 5 rows instantly — no account needed</p>
              </div>
            </>
          )}
        </div>
      ) : null}

      {odsWarning ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          ODS files are not yet supported for the free check. Please export your spreadsheet as CSV and try again.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</p>
      ) : null}

      {/* Results */}
      {result ? (
        <div className="grid gap-5">
          {/* Summary strip */}
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">Free check results</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">{fileName}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setFileName(null);
                  setError(null);
                }}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand hover:text-brand"
              >
                Check another file
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-4">
              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rows checked</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{result.summary.rowCount}</p>
                <p className="mt-1 text-xs text-slate-500">first 5 of {result.totalRowCount} total</p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Eligible donations</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{result.summary.eligibleRowCount}</p>
                <p className="mt-1 text-xs text-slate-500">from the checked rows</p>
              </article>
              <article className={`rounded-2xl border p-4 ${confidence?.color ?? ""}`}>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Confidence</p>
                <p className="mt-2 text-3xl font-semibold">{confidence?.label}</p>
                <p className="mt-1 text-xs opacity-70">{result.summary.confidenceScore}% score</p>
              </article>
              <article className="rounded-2xl border border-brand/20 bg-brand-deep p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-200">Est. total Gift Aid</p>
                <p className="mt-2 text-3xl font-semibold">{formatPounds(estimatedAid)}</p>
                <p className="mt-1 text-xs text-teal-200">across all {result.totalRowCount} rows</p>
              </article>
            </div>

            {result.summary.warnings.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {result.summary.warnings.map((w) => (
                  <p
                    key={w.code}
                    className={`rounded-xl border px-4 py-2.5 text-sm ${
                      w.severity === "high"
                        ? "border-rose-200 bg-rose-50 text-rose-800"
                        : w.severity === "medium"
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {w.message}
                  </p>
                ))}
              </div>
            ) : null}
          </section>

          {/* Row preview */}
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6">
            <h2 className="text-base font-semibold text-slate-900">Checked rows (first 5)</h2>
            <div className="mt-4 grid gap-2">
              {result.rows.map((row) => (
                <div
                  key={row.reference}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-slate-900">{row.reference}</span>
                  <span className="text-slate-600">{formatPounds(row.grossAmountPence)}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      row.eligible
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {row.eligible ? "Eligible" : "Issues found"}
                  </span>
                </div>
              ))}
            </div>

            {/* Blurred teaser for remaining rows */}
            {hasMoreRows ? (
              <div className="relative mt-2">
                <div className="grid gap-2 select-none blur-sm pointer-events-none" aria-hidden>
                  {Array.from({ length: Math.min(3, result.totalRowCount - result.summary.rowCount) }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-slate-900">DON-••••</span>
                      <span className="text-slate-600">£••.••</span>
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
                        Hidden
                      </span>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white/60">
                  <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-slate-600">
                    {result.totalRowCount - result.summary.rowCount} more rows hidden
                  </p>
                </div>
              </div>
            ) : null}
          </section>

          {/* CTA */}
          <section className="rounded-3xl border border-brand/20 bg-brand-deep p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-200">Ready to claim the full amount?</p>
            <h2 className="mt-3 text-2xl font-semibold">
              Sign in to validate all {result.totalRowCount} rows and submit to HMRC
            </h2>
            <p className="mt-3 text-sm leading-7 text-teal-100">
              Your free check shows the potential. The full workspace validates every row, fixes issues automatically, and walks you through submission.
              Just 3% flat commission when claims are processed.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-deep transition hover:bg-teal-50"
              >
                Sign in and run the full check
              </Link>
              <Link
                href="/charity"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Learn how givta works
              </Link>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
