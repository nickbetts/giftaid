import { AuditEventType, ClaimStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { submitClaimToHmrc } from "@/lib/hmrc/client";
import { getOrCreateDefaultCharity } from "@/lib/server/default-charity";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const idempotencyKey = request.headers.get("idempotency-key") ?? crypto.randomUUID();

  const claimId = String(payload.claimId ?? "");
  if (!claimId) {
    return NextResponse.json({ error: "claimId is required." }, { status: 400 });
  }

  const charity = await getOrCreateDefaultCharity();
  const claim = await prisma.claim.findFirst({
    where: { id: claimId, charityId: charity.id },
  });

  if (!claim) {
    return NextResponse.json({ error: "Claim not found." }, { status: 404 });
  }

  if (claim.status !== ClaimStatus.READY) {
    return NextResponse.json({ error: "Only ready claims can be submitted." }, { status: 400 });
  }

  const hmrcResponse = await submitClaimToHmrc({
    claimReference: claim.claimReference,
    estimatedAidPence: claim.estimatedAidPence,
  });

  const updatedClaim = await prisma.claim.update({
    where: { id: claim.id },
    data: {
      status: ClaimStatus.SUBMITTED,
      hmrcSubmissionId: hmrcResponse.hmrcSubmissionId,
      submittedAt: new Date(hmrcResponse.acceptedAt),
      responsePayload: {
        idempotencyKey,
        hmrcResponse,
      },
    },
  });

  await prisma.auditEvent.create({
    data: {
      charityId: charity.id,
      claimId: updatedClaim.id,
      eventType: AuditEventType.CLAIM_SUBMITTED,
      eventPayload: {
        idempotencyKey,
        hmrcSubmissionId: hmrcResponse.hmrcSubmissionId,
      },
    },
  });

  return NextResponse.json(
    {
      submissionId: hmrcResponse.hmrcSubmissionId,
      claimReference: updatedClaim.claimReference,
      idempotencyKey,
      status: updatedClaim.status,
      message: "Claim submitted successfully.",
      queuedAt: hmrcResponse.acceptedAt,
    },
    { status: 200 },
  );
}
