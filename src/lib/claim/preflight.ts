export type IngestionWarning = {
  code: string;
  message: string;
  severity: "low" | "medium" | "high";
};

export type PreflightInput = {
  rowCount: number;
  missingPostcodeRate: number;
  missingSurnameRate: number;
  duplicateReferenceRate: number;
  highValueDonationRate: number;
};

export type PreflightResult = {
  confidenceScore: number;
  riskBand: "low" | "medium" | "high";
  warnings: IngestionWarning[];
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const scoreClaimPreflight = (input: PreflightInput): PreflightResult => {
  const warnings: IngestionWarning[] = [];

  if (input.rowCount < 50) {
    warnings.push({
      code: "LOW_VOLUME_SAMPLE",
      message: "Submission has a low row count, which may reduce confidence in trend-based checks.",
      severity: "low",
    });
  }

  if (input.missingPostcodeRate > 0.1) {
    warnings.push({
      code: "POSTCODE_GAP",
      message: "Missing postcode data is above 10% and may increase rejection risk.",
      severity: "high",
    });
  }

  if (input.missingSurnameRate > 0.08) {
    warnings.push({
      code: "SURNAME_GAP",
      message: "Missing surname data is above 8% and should be corrected before submission.",
      severity: "high",
    });
  }

  if (input.duplicateReferenceRate > 0.03) {
    warnings.push({
      code: "POSSIBLE_DUPLICATES",
      message: "Potential duplicate donation references exceed 3%.",
      severity: "medium",
    });
  }

  if (input.highValueDonationRate > 0.15) {
    warnings.push({
      code: "HIGH_VALUE_PATTERN",
      message: "High-value donation concentration is unusual versus baseline assumptions.",
      severity: "medium",
    });
  }

  const penalty =
    input.missingPostcodeRate * 42 +
    input.missingSurnameRate * 40 +
    input.duplicateReferenceRate * 28 +
    input.highValueDonationRate * 16;

  const confidenceScore = Math.round(clamp(100 - penalty, 8, 99));

  let riskBand: "low" | "medium" | "high" = "low";
  if (confidenceScore < 80) {
    riskBand = "medium";
  }
  if (confidenceScore < 62) {
    riskBand = "high";
  }

  return {
    confidenceScore,
    riskBand,
    warnings,
  };
};
