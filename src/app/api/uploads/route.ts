import { AuditEventType, UploadStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateDefaultCharity } from "@/lib/server/default-charity";
import { storeUploadFile } from "@/lib/storage/blob";
import { parseDonationCsv } from "@/lib/uploads/ingestion";

export async function GET() {
  const charity = await getOrCreateDefaultCharity();

  const uploads = await prisma.donationUpload.findMany({
    where: { charityId: charity.id },
    include: {
      claims: {
        select: {
          id: true,
          claimReference: true,
          status: true,
        },
      },
      rows: {
        select: {
          id: true,
          eligible: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({
    uploads: uploads.map((upload) => ({
      id: upload.id,
      fileName: upload.fileName,
      sourceSystem: upload.sourceSystem,
      status: upload.status,
      rowCount: upload.rowCount,
      parseErrors: Array.isArray(upload.parseErrors) ? upload.parseErrors : [],
      createdAt: upload.createdAt.toISOString(),
      eligibleRowCount: upload.rows.filter((row) => row.eligible !== false).length,
      claim: upload.claims[0] ?? null,
    })),
  });
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const fileName = String(payload.fileName ?? "donations.csv");
  const csvText = String(payload.csvText ?? "");
  const sourceSystem = String(payload.sourceSystem ?? "Manual upload");

  if (!csvText.trim()) {
    return NextResponse.json({ error: "Upload content is required." }, { status: 400 });
  }

  const charity = await getOrCreateDefaultCharity();
  const storedFile = await storeUploadFile(fileName, csvText);

  try {
    const parsed = parseDonationCsv(csvText);
    const status = parsed.summary.parseErrors.length > 0 && parsed.summary.rowCount === 0 ? UploadStatus.FAILED : UploadStatus.READY;

    const upload = await prisma.donationUpload.create({
      data: {
        charityId: charity.id,
        fileName,
        fileStoragePath: storedFile.url,
        sourceSystem,
        status,
        rowCount: parsed.summary.rowCount,
        parseErrors: parsed.summary.parseErrors,
      },
    });

    if (parsed.rows.length > 0) {
      await prisma.donationRow.createMany({
        data: parsed.rows.map((row) => ({
          uploadId: upload.id,
          donationReference: row.donationReference,
          donationDate: row.donationDate,
          grossAmountPence: row.grossAmountPence,
          donorTitle: row.donorTitle,
          donorFirstName: row.donorFirstName,
          donorLastName: row.donorLastName,
          donorPostcode: row.donorPostcode,
          donorHouseNameOrNumber: row.donorHouseNameOrNumber,
          eligible: row.eligible,
          validationMessages: row.validationMessages,
        })),
      });
    }

    await prisma.auditEvent.create({
      data: {
        charityId: charity.id,
        eventType: AuditEventType.INGESTION_CREATED,
        eventPayload: {
          uploadId: upload.id,
          fileName,
          rowCount: parsed.summary.rowCount,
          confidenceScore: parsed.summary.confidenceScore,
          storagePath: storedFile.url,
        },
      },
    });

    return NextResponse.json({
      upload: {
        id: upload.id,
        fileName: upload.fileName,
        status: upload.status,
        rowCount: upload.rowCount,
        sourceSystem: upload.sourceSystem,
        createdAt: upload.createdAt.toISOString(),
      },
      summary: parsed.summary,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload parsing failed.";

    const failedUpload = await prisma.donationUpload.create({
      data: {
        charityId: charity.id,
        fileName,
        fileStoragePath: storedFile.url,
        sourceSystem,
        status: UploadStatus.FAILED,
        rowCount: 0,
        parseErrors: [message],
      },
    });

    await prisma.auditEvent.create({
      data: {
        charityId: charity.id,
        eventType: AuditEventType.INGESTION_CREATED,
        eventPayload: {
          uploadId: failedUpload.id,
          fileName,
          error: message,
        },
      },
    });

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
