import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateDefaultCharity } from "@/lib/server/default-charity";

export async function GET() {
  const charity = await getOrCreateDefaultCharity();

  const claims = await prisma.claim.findMany({
    where: { charityId: charity.id },
    include: {
      upload: {
        select: {
          fileName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    claims: claims.map((claim) => ({
      id: claim.id,
      claimReference: claim.claimReference,
      status: claim.status,
      confidenceScore: claim.confidenceScore,
      estimatedAidPence: claim.estimatedAidPence,
      taxYear: claim.taxYear,
      createdAt: claim.createdAt.toISOString(),
      submittedAt: claim.submittedAt?.toISOString() ?? null,
      hmrcSubmissionId: claim.hmrcSubmissionId,
      uploadFileName: claim.upload?.fileName ?? null,
    })),
  });
}
