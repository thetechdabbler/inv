/**
 * Log a valuation (point-in-time value) for an account.
 * Returns the created valuation or null if account not found.
 */

import * as accountRepo from "@/infrastructure/prisma/account-repository";
import * as valuationRepo from "@/infrastructure/prisma/valuation-repository";
import type { Valuation } from "@/domain/portfolio/types";

export interface LogValuationInput {
  accountId: string;
  date: Date;
  valuePaise: number;
}

export async function logValuation(
  input: LogValuationInput,
): Promise<Valuation | null> {
  const exists = await accountRepo.existsAccount(input.accountId);
  if (!exists) return null;
  return valuationRepo.createValuation(
    input.accountId,
    input.date,
    input.valuePaise,
  );
}
