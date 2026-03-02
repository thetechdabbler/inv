/**
 * List accounts with current value and total contributions.
 */

import * as accountRepo from "@/infrastructure/prisma/account-repository";
import * as valuationRepo from "@/infrastructure/prisma/valuation-repository";
import * as transactionRepo from "@/infrastructure/prisma/transaction-repository";
import type { AccountListItem } from "@/domain/portfolio/types";

export async function listAccounts(): Promise<AccountListItem[]> {
  const accounts = await accountRepo.findAllAccounts();
  if (accounts.length === 0) return [];
  const accountIds = accounts.map((a) => a.id);
  const [latestValues, totalContributions] = await Promise.all([
    valuationRepo.getLatestValuesForAccountIds(accountIds),
    transactionRepo.getTotalContributionsForAccountIds(accountIds),
  ]);
  return accounts.map((a) => ({
    ...a,
    currentValuePaise:
      latestValues.get(a.id) ?? a.initialBalancePaise,
    totalContributionsPaise: totalContributions.get(a.id) ?? 0,
  }));
}
