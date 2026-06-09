import { AuditEventType, ClaimStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { scoreClaimPreflight } from "@/lib/claim/preflight";

function buildClaimReference() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `CLAIM-${stamp}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function inferTaxYear() {
  const now = new Date();
  const year = now.getUTCMonth() >= 3 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
  return `${year}-${year + 1}`;
}

export async function createClaimForUpload(charityId: string, uploadId: string) {
  const upload = await prisma.donationUpload.findFirst({
    where: { id: uploadId, charityId },
    include: { rows: true },
  });

  if (!upload) {
    throw new Error("Upload not found.");
  }

  const existingClaim = await prisma.claim.findFirst({
    where: { uploadId: upload.id },
  });

  if (existingClaim) {
    return existingClaim;
  }

  const eligibleRows = upload.rows.filter((row) => row.eligible !== false);
  const confidence = scoreClaimPreflight({
    rowCount: upload.rows.length,
    missingPostcodeRate: upload.rows.length
      ? upload.rows.filter((row) => !row.donorPostcode).length / upload.rows.length
      : 0,
    missingSurnameRate: upload.rows.length
      ? upload.rows.filter((row) => !row.donorLastName).length / upload.rows.length
      : 0,
    duplicateReferenceRate: 0,
    highValueDonationRate: upload.rows.length
      ? upload.rows.filter((row) => row.grossAmountPence >= 25000).length / upload.rows.length
      : 0,
  });

  const estimatedAidPence = eligibleRows.reduce((sum, row) => sum + Math.round(row.grossAmountPence / 4), 0);
  const status = confidence.confidenceScore >= 70 ? ClaimStatus.READY : ClaimStatus.REQUIRES_REVIEW;

  const claim = await prisma.claim.create({
    data: {
      charityId,
      uploadId: upload.id,
      claimReference: buildClaimReference(),
      taxYear: inferTaxYear(),
      status,
      confidenceScore: confidence.confidenceScore,
      estimatedAidPence,
      claimItems: {
        create: upload.rows.map((row) => ({
          donationRowId: row.id,
          aidAmountPence: row.eligible === false ? 0 : Math.round(row.grossAmountPence / 4),
          isEligible: row.eligible !== false,
          ineligibleReason: row.eligible === false ? "Donation row failed validation checks." : undefined,
        })),
      },
    },
  });

  await prisma.auditEvent.create({
    data: {
      charityId,
      claimId: claim.id,
      eventType: AuditEventType.CLAIM_CREATED,
      eventPayload: {
        uploadId: upload.id,
        claimReference: claim.claimReference,
        confidenceScore: claim.confidenceScore,
      },
    },
  });

  return claim;
}
