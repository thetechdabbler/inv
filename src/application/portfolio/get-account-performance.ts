/**
 * Get performance snapshot for one account.
 */

import type { PerformanceSnapshot } from "@/domain/portfolio/types";
import * as accountRepo from "@/infrastructure/prisma/account-repository";
import * as transactionRepo from "@/infrastructure/prisma/transaction-repository";
import * as valuationRepo from "@/infrastructure/prisma/valuation-repository";

export async function getAccountPerformance(
	accountId: string,
): Promise<PerformanceSnapshot | null> {
	const account = await accountRepo.findAccountById(accountId);
	if (!account) return null;
	const [totalContributions, totalWithdrawals, currentValue] =
		await Promise.all([
			transactionRepo.sumInvestmentAmountByAccountId(accountId),
			transactionRepo.sumWithdrawalAmountByAccountId(accountId),
			valuationRepo.findLatestValueByAccountId(accountId),
		]);
	const netInvestedPaise =
		account.initialBalancePaise + totalContributions - totalWithdrawals;
	const currentValuePaise = currentValue ?? account.initialBalancePaise;
	const profitLossPaise = currentValuePaise - netInvestedPaise;
	const percentReturn =
		netInvestedPaise > 0 ? (profitLossPaise / netInvestedPaise) * 100 : null;
	return {
		totalContributionsPaise: totalContributions,
		totalWithdrawalsPaise: totalWithdrawals,
		netInvestedPaise,
		currentValuePaise,
		profitLossPaise,
		percentReturn,
	};
}
