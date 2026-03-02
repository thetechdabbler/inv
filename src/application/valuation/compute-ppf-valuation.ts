/**
 * Compute PPF valuation and persist as Valuation record.
 */

import * as accountRepo from "@/infrastructure/prisma/account-repository";
import * as transactionRepo from "@/infrastructure/prisma/transaction-repository";
import * as valuationRepo from "@/infrastructure/prisma/valuation-repository";
import * as rateRepo from "@/infrastructure/prisma/interest-rate-config-repository";
import { computePPF } from "@/domain/valuation/ppf-calculator";
import { DEFAULT_PPF_RATE } from "@/domain/valuation/types";

export async function computePPFValuation(
  accountId: string,
  asOfDate: Date,
): Promise<{ valuePaise: number; asOfDate: Date } | null> {
  const account = await accountRepo.findAccountById(accountId);
  if (!account || account.type !== "ppf") return null;
  const transactions = await transactionRepo.findTransactionsByAccountId(
    accountId,
    { limit: 10000 },
  );
  const ratesByYear = await rateRepo.findAllYearsForAccountType("ppf");
  const getRateForYear = (fy: number) => ratesByYear.get(fy) ?? DEFAULT_PPF_RATE;
  const valuePaise = computePPF({
    initialBalancePaise: account.initialBalancePaise,
    transactions,
    asOfDate,
    getRateForYear,
  });
  await valuationRepo.createValuation(accountId, asOfDate, valuePaise);
  return { valuePaise, asOfDate };
}
