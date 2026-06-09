import {
  buildR68Xml,
  parseGovTalkResponse,
  taxYearToPeriodEnd,
  type CharityXmlInfo,
  type DonationXmlRecord,
} from "./xml-builder";

export type HmrcSubmissionResult = {
  hmrcSubmissionId: string;
  acceptedAt: string;
  status: "submitted";
  responseMessage: string;
};

export type HmrcSubmissionInput = {
  claimReference: string;
  taxYear: string;
  charity: CharityXmlInfo;
  donations: DonationXmlRecord[];
};

/**
 * Returns the configured HMRC gateway URL.
 *
 * Priority:
 *   1. HMRC_GATEWAY_URL env var (explicit override, e.g. LTS local port)
 *   2. Test endpoint when HMRC_TEST_MODE=true
 *   3. Live endpoint
 *
 * LTS (Local Test Service) runs on your machine — set HMRC_GATEWAY_URL=http://localhost:9090/
 * HMRC remote test engine: https://test-transaction-engine.tax.service.gov.uk/submission
 * HMRC live: https://online.hmrc.gov.uk/submission
 */
function resolveGatewayUrl(): string {
  if (process.env.HMRC_GATEWAY_URL) {
    return process.env.HMRC_GATEWAY_URL;
  }
  if (process.env.HMRC_TEST_MODE === "true") {
    return "https://test-transaction-engine.tax.service.gov.uk/submission";
  }
  return "https://online.hmrc.gov.uk/submission";
}

function isTestMode(): boolean {
  return (
    process.env.HMRC_TEST_MODE === "true" ||
    (process.env.HMRC_GATEWAY_URL ?? "").includes("localhost") ||
    (process.env.HMRC_GATEWAY_URL ?? "").includes("test-transaction-engine")
  );
}

export async function submitClaimToHmrc(options: HmrcSubmissionInput): Promise<HmrcSubmissionResult> {
  const gatewayUsername = process.env.HMRC_GATEWAY_USERNAME ?? "";
  const gatewayPassword = process.env.HMRC_GATEWAY_PASSWORD ?? "";
  const gatewayUrl = resolveGatewayUrl();
  const testMode = isTestMode();

  if (!gatewayUsername || !gatewayPassword) {
    throw new Error(
      "HMRC_GATEWAY_USERNAME and HMRC_GATEWAY_PASSWORD must be set to submit claims.",
    );
  }
  if (!options.charity.hmrcReference) {
    throw new Error("Charity HMRC reference is required to submit a claim.");
  }
  if (options.donations.length === 0) {
    throw new Error("No eligible donations to submit.");
  }

  const periodEnd = taxYearToPeriodEnd(options.taxYear);

  const xml = buildR68Xml({
    charity: options.charity,
    claimReference: options.claimReference,
    periodEnd,
    donations: options.donations,
    isTest: testMode,
    gatewayUsername,
    gatewayPassword,
  });

  const response = await fetch(gatewayUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      Accept: "application/xml",
    },
    body: xml,
  });

  const responseText = await response.text();

  if (!response.ok && !responseText.includes("GovTalkMessage")) {
    throw new Error(
      `HMRC gateway returned HTTP ${response.status}: ${responseText.slice(0, 200)}`,
    );
  }

  const parsed = parseGovTalkResponse(responseText);

  if (parsed.qualifier === "error") {
    const detail = parsed.errors?.join("; ") ?? "Unknown HMRC error";
    throw new Error(`HMRC rejected claim: ${detail}`);
  }

  // "poll" means async processing — use correlationId as the submission reference
  const hmrcSubmissionId =
    parsed.correlationId ?? `hmrc_${crypto.randomUUID()}`;

  return {
    hmrcSubmissionId,
    acceptedAt: new Date().toISOString(),
    status: "submitted",
    responseMessage:
      parsed.qualifier === "acknowledgement"
        ? `Claim ${options.claimReference} accepted by HMRC (${testMode ? "test" : "live"}).`
        : `Claim ${options.claimReference} queued for processing (correlationId: ${hmrcSubmissionId}).`,
  };
}
