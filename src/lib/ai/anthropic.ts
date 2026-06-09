import Anthropic from "@anthropic-ai/sdk";

type UploadGuidanceInput = {
  fileName: string;
  sourceSystem?: string | null;
  rowCount: number;
  eligibleRowCount: number;
  confidenceScore: number;
  riskBand: "low" | "medium" | "high";
  warnings: Array<{
    code: string;
    message: string;
    severity: "low" | "medium" | "high";
  }>;
  parseErrors: string[];
};

export type UploadGuidanceResult = {
  summary: string;
  nextSteps: string[];
  donorDataAdvice: string[];
  confidenceNote: string;
  model: string;
};

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }

  return new Anthropic({ apiKey });
}

export async function generateUploadGuidance(input: UploadGuidanceInput): Promise<UploadGuidanceResult> {
  const client = getAnthropicClient();
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";

  if (!client) {
    return {
      summary: "The upload has been checked and you can review the warnings below before creating a claim.",
      nextSteps: [
        "Review any missing donor details first.",
        "Confirm duplicates before you create the claim.",
        "Create the claim once the file looks complete.",
      ],
      donorDataAdvice: [
        "Make sure surnames and postcodes are present where possible.",
        "Check that donation references are unique within the file.",
      ],
      confidenceNote: `Current confidence score is ${input.confidenceScore}% with a ${input.riskBand} risk band.`,
      model,
    };
  }

  const prompt = `You are helping a UK charity team understand a Gift Aid upload in plain English.
Write in a warm, calm, practical tone.
Do not mention AI, models, or automation.
Do not use em dashes.
Do not use semicolons.
Keep the advice specific to the upload summary.
Return JSON only with this shape:
{
  "summary": string,
  "nextSteps": string[],
  "donorDataAdvice": string[],
  "confidenceNote": string
}

Upload context:
${JSON.stringify(input, null, 2)}`;

  const response = await client.messages.create({
    model,
    max_tokens: 700,
    temperature: 0.3,
    system:
      "You explain compliance-heavy charity workflows in friendly plain English for operational teams. Keep answers concrete and grounded in the provided facts.",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  const parsed = JSON.parse(text) as Omit<UploadGuidanceResult, "model">;

  return {
    ...parsed,
    model,
  };
}
