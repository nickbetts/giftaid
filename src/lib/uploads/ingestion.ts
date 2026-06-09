import { parse } from "csv-parse/sync";
import { scoreClaimPreflight, type IngestionWarning } from "@/lib/claim/preflight";

export type ParsedDonationRow = {
  donationReference: string;
  donationDate: Date;
  grossAmountPence: number;
  donorTitle?: string;
  donorFirstName?: string;
  donorLastName?: string;
  donorPostcode?: string;
  donorHouseNameOrNumber?: string;
  eligible: boolean;
  validationMessages: IngestionWarning[];
};

export type IngestionSummary = {
  rowCount: number;
  confidenceScore: number;
  riskBand: "low" | "medium" | "high";
  warnings: IngestionWarning[];
  eligibleRowCount: number;
  parseErrors: string[];
};

const REQUIRED_HEADERS = ["donationreference", "donationdate", "grossamount"];

function normaliseHeader(header: string) {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function toPence(amount: string) {
  const numeric = Number(String(amount).replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return Math.round(numeric * 100);
}

function toDate(input: string) {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function parseDonationCsv(csvText: string) {
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  if (!records.length) {
    throw new Error("The uploaded file does not contain any donation rows.");
  }

  const firstRecord = records[0] ?? {};
  const availableHeaders = Object.keys(firstRecord).map(normaliseHeader);
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !availableHeaders.includes(header));

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
  }

  const seenReferences = new Set<string>();
  let missingPostcodeCount = 0;
  let missingSurnameCount = 0;
  let duplicateReferenceCount = 0;
  let highValueDonationCount = 0;
  const parseErrors: string[] = [];

  const rows = records.flatMap((record, index) => {
    const shaped = Object.fromEntries(Object.entries(record).map(([key, value]) => [normaliseHeader(key), value]));
    const validationMessages: IngestionWarning[] = [];

    const donationReference = String(shaped.donationreference ?? "").trim();
    const donationDate = toDate(String(shaped.donationdate ?? ""));
    const grossAmountPence = toPence(String(shaped.grossamount ?? ""));
    const donorLastName = String(shaped.donorlastname ?? shaped.lastname ?? "").trim() || undefined;
    const donorPostcode = String(shaped.donorpostcode ?? shaped.postcode ?? "").trim().toUpperCase() || undefined;

    if (!donationReference) {
      parseErrors.push(`Row ${index + 2}: missing donation reference.`);
      return [];
    }

    if (!donationDate) {
      parseErrors.push(`Row ${index + 2}: invalid donation date.`);
      return [];
    }

    if (grossAmountPence === null) {
      parseErrors.push(`Row ${index + 2}: invalid gross amount.`);
      return [];
    }

    if (!donorLastName) {
      missingSurnameCount += 1;
      validationMessages.push({
        code: "SURNAME_MISSING",
        message: "Donor surname is missing.",
        severity: "high",
      });
    }

    if (!donorPostcode) {
      missingPostcodeCount += 1;
      validationMessages.push({
        code: "POSTCODE_MISSING",
        message: "Donor postcode is missing.",
        severity: "high",
      });
    }

    if (seenReferences.has(donationReference)) {
      duplicateReferenceCount += 1;
      validationMessages.push({
        code: "DUPLICATE_REFERENCE",
        message: "Donation reference appears more than once in this file.",
        severity: "medium",
      });
    }

    seenReferences.add(donationReference);

    if (grossAmountPence >= 25000) {
      highValueDonationCount += 1;
    }

    return [
      {
        donationReference,
        donationDate,
        grossAmountPence,
        donorTitle: String(shaped.donortitle ?? shaped.title ?? "").trim() || undefined,
        donorFirstName: String(shaped.donorfirstname ?? shaped.firstname ?? "").trim() || undefined,
        donorLastName,
        donorPostcode,
        donorHouseNameOrNumber:
          String(shaped.donorhousenameornumber ?? shaped.housenameornumber ?? shaped.address1 ?? "").trim() ||
          undefined,
        eligible: validationMessages.every((item) => item.severity !== "high"),
        validationMessages,
      },
    ];
  });

  const rowCount = rows.length;
  const scoring = scoreClaimPreflight({
    rowCount,
    missingPostcodeRate: rowCount ? missingPostcodeCount / rowCount : 0,
    missingSurnameRate: rowCount ? missingSurnameCount / rowCount : 0,
    duplicateReferenceRate: rowCount ? duplicateReferenceCount / rowCount : 0,
    highValueDonationRate: rowCount ? highValueDonationCount / rowCount : 0,
  });

  return {
    rows,
    summary: {
      rowCount,
      confidenceScore: scoring.confidenceScore,
      riskBand: scoring.riskBand,
      warnings: scoring.warnings,
      eligibleRowCount: rows.filter((row) => row.eligible).length,
      parseErrors,
    } satisfies IngestionSummary,
  };
}
