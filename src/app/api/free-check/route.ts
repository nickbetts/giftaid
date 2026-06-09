import { NextRequest, NextResponse } from "next/server";
import { parseDonationCsv } from "@/lib/uploads/ingestion";

export async function POST(request: NextRequest) {
  const payload = await request.json() as { csvText?: unknown; totalRowCount?: unknown };
  const csvText = String(payload.csvText ?? "").trim();
  const totalRowCount = Number(payload.totalRowCount ?? 0);

  if (!csvText) {
    return NextResponse.json({ error: "No file content received." }, { status: 400 });
  }

  try {
    const { rows, summary } = parseDonationCsv(csvText);

    return NextResponse.json({
      summary: {
        rowCount: summary.rowCount,
        eligibleRowCount: summary.eligibleRowCount,
        confidenceScore: summary.confidenceScore,
        riskBand: summary.riskBand,
        warnings: summary.warnings,
        parseErrors: summary.parseErrors,
      },
      rows: rows.map((r) => ({
        reference: r.donationReference,
        grossAmountPence: r.grossAmountPence,
        eligible: r.eligible,
        issues: r.validationMessages,
      })),
      totalRowCount: Math.max(totalRowCount, summary.rowCount),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not parse the file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
