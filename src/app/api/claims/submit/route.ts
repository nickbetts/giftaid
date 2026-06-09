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

  // Fetch claim with eligible donation rows for XML construction
  const claim = await prisma.claim.findFirst({
    where: { id: claimId, charityId: charity.id },
    include: {
      claimItems: {
        where: { isEligible: true },
        include: { claim: false },
      },
    },
  });

  if (!claim) {
    return NextResponse.json({ error: "Claim not found." }, { status: 404 });
  }

  if (claim.status !== ClaimStatus.READY) {
    return NextResponse.json({ error: "Only ready claims can be submitted." }, { status: 400 });
  }

  if (!charity.hmrcReference) {
    return NextResponse.json(
      { error: "Charity HMRC reference is not configured. Set DEFAULT_CHARITY_HMRC_REFERENCE." },
      { status: 422 },
    );
  }

  // Load donation rows for the eligible claim items
  const eligibleRowIds = claim.claimItems.map((item) => item.donationRowId);
  const donationRows = await prisma.donationRow.findMany({
    where: { id: { in: eligibleRowIds } },
  });

  if (donationRows.length === 0) {
    return NextResponse.json(
      { error: "No eligible donation rows found for this claim." },
      { status: 422 },
    );
  }

  const hmrcResponse = await submitClaimToHmrc({
    claimReference: claim.claimReference,
    taxYear: claim.taxYear,
    charity: {
      hmrcReference: charity.hmrcReference,
      orgName: charity.name,
      regName: (process.env.HMRC_CHARITY_REG_NAME as "CCEW" | "CCNI" | "OSCR") || undefined,
      regNo: process.env.HMRC_CHARITY_REG_NO || undefined,
      authorisedOfficialTitle: process.env.HMRC_OFFICIAL_TITLE || undefined,
      authorisedOfficialForename: process.env.HMRC_OFFICIAL_FORENAME ?? "Admin",
      authorisedOfficialSurname: process.env.HMRC_OFFICIAL_SURNAME ?? "User",
      authorisedOfficialPostcode: process.env.HMRC_OFFICIAL_POSTCODE ?? "",
      authorisedOfficialPhone: process.env.HMRC_OFFICIAL_PHONE ?? "01234567890",
      contactEmail: process.env.HMRC_CONTACT_EMAIL ?? "admin@example.com",
    },
    donations: donationRows.map((row) => ({
      donorTitle: row.donorTitle,
      donorFirstName: row.donorFirstName ?? "Unknown",
      donorLastName: row.donorLastName ?? "Unknown",
      donorHouseNameOrNumber: row.donorHouseNameOrNumber,
      donorPostcode: row.donorPostcode,
      donationDate: row.donationDate,
      grossAmountPence: row.grossAmountPence,
    })),
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
