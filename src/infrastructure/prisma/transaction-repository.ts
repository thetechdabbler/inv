/**
 * Transaction repository (Prisma) - used in bolt 002 for contributions.
 * Stub for bolt 001: total contributions for list = 0 or initial balance.
 */

import { prisma } from "./client";

export async function sumInvestmentAmountByAccountId(
  accountId: string,
): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: { accountId, type: "investment" },
    _sum: { amountPaise: true },
  });
  return result._sum.amountPaise ?? 0;
}

/** Total contributions = sum of investment transactions only (for list/display). */
export async function getTotalContributionsForAccountIds(
  accountIds: string[],
): Promise<Map<string, number>> {
  if (accountIds.length === 0) return new Map();
  const inv = await prisma.transaction.groupBy({
    by: ["accountId"],
    _sum: { amountPaise: true },
    where: { accountId: { in: accountIds }, type: "investment" },
  });
  return new Map(inv.map((i) => [i.accountId, i._sum.amountPaise ?? 0]));
}
