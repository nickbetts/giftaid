"use client";

import { useState } from "react";

type PreflightResponse = {
  submittedAt: string;
  confidenceScore: number;
  riskBand: "low" | "medium" | "high";
  warnings: Array<{
    code: string;
    message: string;
    severity: "low" | "medium" | "high";
  }>;
};

const initialPayload = {
  rowCount: 2400,
  missingPostcodeRate: 0.06,
  missingSurnameRate: 0.03,
  duplicateReferenceRate: 0.01,
  highValueDonationRate: 0.07,
};

export default function UploadPage() {
  const [payload, setPayload] = useState(initialPayload);
  const [result, setResult] = useState<PreflightResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const runPreflight = async () => {
    setLoading(true);
    const response = await fetch("/api/ingestion/preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as PreflightResponse;
    setResult(data);
    setLoading(false);
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-20 pt-8 md:px-10">
      <header className="rounded-3xl border border-slate-200 bg-white/85 p-7">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">Ingestion preflight</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Test claim quality before upload</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          This is the first AI-assisted slice. Enter quality signals and run a risk profile before data enters HMRC submission flow.
        </p>
      </header>

      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 md:grid-cols-2">
        {Object.entries(payload).map(([field, value]) => (
          <label key={field} className="grid gap-2 text-sm font-medium text-slate-700">
            {field}
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 font-mono text-sm text-slate-800 outline-none ring-brand transition focus:ring-2"
              type="number"
              step={field === "rowCount" ? 1 : 0.01}
              value={value}
              onChange={(event) => {
                const next = Number(event.target.value);
                setPayload((current) => ({ ...current, [field]: next }));
              }}
            />
          </label>
        ))}
      </section>

      <div>
        <button
          type="button"
          onClick={runPreflight}
          disabled={loading}
          className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Calculating..." : "Run preflight"}
        </button>
      </div>

      {result ? (
        <section className="rounded-3xl border border-slate-200 bg-white/85 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Result</h2>
          <p className="mt-3 text-sm text-slate-700">Confidence score: {result.confidenceScore}%</p>
          <p className="mt-1 text-sm text-slate-700">Risk band: {result.riskBand}</p>
          <ul className="mt-4 grid gap-2">
            {result.warnings.map((warning) => (
              <li key={warning.code} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <span className="font-semibold">{warning.code}</span>: {warning.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
