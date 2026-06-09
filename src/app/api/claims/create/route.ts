import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDefaultCharity } from "@/lib/server/default-charity";
import { createClaimForUpload } from "@/lib/claims/service";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const uploadId = String(payload.uploadId ?? "");

  if (!uploadId) {
    return NextResponse.json({ error: "uploadId is required." }, { status: 400 });
  }

  const charity = await getOrCreateDefaultCharity();

  try {
    const claim = await createClaimForUpload(charity.id, uploadId);

    return NextResponse.json({
      claim: {
        id: claim.id,
        claimReference: claim.claimReference,
        status: claim.status,
        confidenceScore: claim.confidenceScore,
        estimatedAidPence: claim.estimatedAidPence,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create claim." },
      { status: 400 },
    );
  }
}
