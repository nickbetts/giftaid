import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateUploadGuidance } from "@/lib/ai/anthropic";
import { getOrCreateDefaultCharity } from "@/lib/server/default-charity";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const charity = await getOrCreateDefaultCharity();

  try {
    const guidance = await generateUploadGuidance({
      fileName: String(payload.fileName ?? "donations.csv"),
      sourceSystem: payload.sourceSystem ? String(payload.sourceSystem) : null,
      rowCount: Number(payload.rowCount ?? 0),
      eligibleRowCount: Number(payload.eligibleRowCount ?? 0),
      confidenceScore: Number(payload.confidenceScore ?? 0),
      riskBand: payload.riskBand === "high" || payload.riskBand === "medium" ? payload.riskBand : "low",
      warnings: Array.isArray(payload.warnings) ? payload.warnings : [],
      parseErrors: Array.isArray(payload.parseErrors) ? payload.parseErrors : [],
    });

    await prisma.aiEvent.create({
      data: {
        charityId: charity.id,
        feature: "upload_guidance",
        promptRedacted: JSON.stringify({
          fileName: payload.fileName,
          sourceSystem: payload.sourceSystem,
          rowCount: payload.rowCount,
          eligibleRowCount: payload.eligibleRowCount,
          confidenceScore: payload.confidenceScore,
          riskBand: payload.riskBand,
        }),
        outputSummary: guidance.summary,
        confidenceScore: Number(payload.confidenceScore ?? 0),
      },
    });

    return NextResponse.json(guidance);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate upload guidance." },
      { status: 500 },
    );
  }
}
