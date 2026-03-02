/**
 * Valuation repository implementation (Prisma).
 */

import { prisma } from "./client";

export async function createValuation(
  accountId: string,
  date: Date,
  valuePaise: number,
): Promise<{ id: string }> {
  const v = await prisma.valuation.create({
    data: { accountId, date, valuePaise },
    select: { id: true },
  });
  return { id: v.id };
}

export async function findLatestValueByAccountId(
  accountId: string,
): Promise<number | null> {
  const v = await prisma.valuation.findFirst({
    where: { accountId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    select: { valuePaise: true },
  });
  return v?.valuePaise ?? null;
}

export async function getLatestValuesForAccountIds(
  accountIds: string[],
): Promise<Map<string, number>> {
  if (accountIds.length === 0) return new Map();
  const map = new Map<string, number>();
  for (const accountId of accountIds) {
    const v = await prisma.valuation.findFirst({
      where: { accountId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: { valuePaise: true },
    });
    if (v) map.set(accountId, v.valuePaise);
  }
  return map;
}
