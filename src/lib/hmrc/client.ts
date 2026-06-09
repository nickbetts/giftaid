export type HmrcSubmissionResult = {
  hmrcSubmissionId: string;
  acceptedAt: string;
  status: "submitted";
  responseMessage: string;
};

export async function submitClaimToHmrc(options: {
  claimReference: string;
  estimatedAidPence: number;
}) {
  return {
    hmrcSubmissionId: `hmrc_${crypto.randomUUID()}`,
    acceptedAt: new Date().toISOString(),
    status: "submitted",
    responseMessage: `Stub submission accepted for ${options.claimReference}.`,
  } satisfies HmrcSubmissionResult;
}
