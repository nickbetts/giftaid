import { NextRequest, NextResponse } from "next/server";
import { scoreClaimPreflight } from "@/lib/claim/preflight";

export async function POST(request: NextRequest) {
  const payload = await request.json();

  const result = scoreClaimPreflight({
    rowCount: Number(payload.rowCount ?? 0),
    missingPostcodeRate: Number(payload.missingPostcodeRate ?? 0),
    missingSurnameRate: Number(payload.missingSurnameRate ?? 0),
    duplicateReferenceRate: Number(payload.duplicateReferenceRate ?? 0),
    highValueDonationRate: Number(payload.highValueDonationRate ?? 0),
  });

  return NextResponse.json({
    submittedAt: new Date().toISOString(),
    ...result,
  });
}
