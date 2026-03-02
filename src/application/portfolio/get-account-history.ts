/**
 * Get chronological history (transactions + valuations) for an account.
 */

import * as accountRepo from "@/infrastructure/prisma/account-repository";
import * as transactionRepo from "@/infrastructure/prisma/transaction-repository";
import * as valuationRepo from "@/infrastructure/prisma/valuation-repository";
import type { HistoryEntry } from "@/domain/portfolio/types";

export interface GetAccountHistoryInput {
  accountId: string;
  from?: Date;
  to?: Date;
  limit?: number;
}

export async function getAccountHistory(
  input: GetAccountHistoryInput,
): Promise<HistoryEntry[] | null> {
  const exists = await accountRepo.existsAccount(input.accountId);
  if (!exists) return null;
  const limit = Math.min(Math.max(1, input.limit ?? 50), 500);
  const [transactions, valuations] = await Promise.all([
    transactionRepo.findTransactionsByAccountId(input.accountId, {
      from: input.from,
      to: input.to,
      limit: limit * 2,
    }),
    valuationRepo.findValuationsByAccountId(input.accountId, {
      from: input.from,
      to: input.to,
    }),
  ]);
  const entries: HistoryEntry[] = [];
  for (const t of transactions) {
    entries.push({
      date: t.date.toISOString().slice(0, 10),
      type: t.type,
      amountOrValuePaise: t.amountPaise,
      description: t.description,
      createdAt: t.createdAt.toISOString(),
    });
  }
  for (const v of valuations) {
    entries.push({
      date: v.date.toISOString().slice(0, 10),
      type: "valuation",
      amountOrValuePaise: v.valuePaise,
      createdAt: v.createdAt.toISOString(),
    });
  }
  entries.sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    if (d !== 0) return d;
    return a.createdAt.localeCompare(b.createdAt);
  });
  return entries.slice(0, limit);
}
