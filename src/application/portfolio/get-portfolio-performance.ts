/**
 * Get aggregated performance across all accounts.
 */

import { listAccounts } from "@/application/portfolio/list-accounts";
import * as transactionRepo from "@/infrastructure/prisma/transaction-repository";
import * as valuationRepo from "@/infrastructure/prisma/valuation-repository";
import type { PerformanceSnapshot } from "@/domain/portfolio/types";

export async function getPortfolioPerformance(): Promise<PerformanceSnapshot> {
  const accounts = await listAccounts();
  if (accounts.length === 0) {
    return {
      totalContributionsPaise: 0,
      totalWithdrawalsPaise: 0,
      netInvestedPaise: 0,
      currentValuePaise: 0,
      profitLossPaise: 0,
      percentReturn: null,
    };
  }
  const accountIds = accounts.map((a) => a.id);
  const [contributionsMap, withdrawalsMap, latestValuesMap] = await Promise.all([
    transactionRepo.getTotalContributionsForAccountIds(accountIds),
    transactionRepo.getTotalWithdrawalsForAccountIds(accountIds),
    valuationRepo.getLatestValuesForAccountIds(accountIds),
  ]);
  let totalContributionsPaise = 0;
  let totalWithdrawalsPaise = 0;
  let currentValuePaise = 0;
  let totalInitialPaise = 0;
  for (const a of accounts) {
    totalContributionsPaise += contributionsMap.get(a.id) ?? 0;
    totalWithdrawalsPaise += withdrawalsMap.get(a.id) ?? 0;
    currentValuePaise +=
      latestValuesMap.get(a.id) ?? a.initialBalancePaise;
    totalInitialPaise += a.initialBalancePaise;
  }
  const netInvestedPaise =
    totalInitialPaise + totalContributionsPaise - totalWithdrawalsPaise;
  const profitLossPaise = currentValuePaise - netInvestedPaise;
  const percentReturn =
    netInvestedPaise > 0 ? (profitLossPaise / netInvestedPaise) * 100 : null;
  return {
    totalContributionsPaise,
    totalWithdrawalsPaise,
    netInvestedPaise,
    currentValuePaise,
    profitLossPaise,
    percentReturn,
  };
}
