import { prisma } from "@/lib/db";

export async function getOrCreateDefaultCharity() {
  const existing = await prisma.charity.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    return existing;
  }

  return prisma.charity.create({
    data: {
      name: process.env.DEFAULT_CHARITY_NAME ?? "GiftAid Demo Charity",
      hmrcReference: process.env.DEFAULT_CHARITY_HMRC_REFERENCE || undefined,
    },
  });
}
