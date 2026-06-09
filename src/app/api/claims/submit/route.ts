import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const payload = await request.json();

  const idempotencyKey = request.headers.get("idempotency-key") ?? crypto.randomUUID();

  return NextResponse.json(
    {
      submissionId: `sub_${crypto.randomUUID()}`,
      claimReference: payload.claimReference ?? "pending-reference",
      idempotencyKey,
      status: "queued",
      message: "Claim accepted into queue. HMRC adapter wiring is next.",
      queuedAt: new Date().toISOString(),
    },
    { status: 202 },
  );
}
