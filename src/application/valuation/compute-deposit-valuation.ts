/**
 * Compute bank deposit valuation and persist as Valuation record.
 */

import { computeDeposit } from "@/domain/valuation/deposit-calculator";
import * as accountRepo from "@/infrastructure/prisma/account-repository";
import * as rateRepo from "@/infrastructure/prisma/interest-rate-config-repository";
import * as transactionRepo from "@/infrastructure/prisma/transaction-repository";
import * as valuationRepo from "@/infrastructure/prisma/valuation-repository";

export async function computeDepositValuation(
	accountId: string,
	asOfDate: Date,
): Promise<{ valuePaise: number; asOfDate: Date } | null> {
	const account = await accountRepo.findAccountById(accountId);
	if (!account || account.type !== "bank_deposit") return null;
	const config = await rateRepo.findDepositConfigForAccount(accountId);
	if (!config) return null;
	const transactions = await transactionRepo.findTransactionsByAccountId(
		accountId,
		{ limit: 10000 },
	);
	const valuePaise = computeDeposit({
		initialBalancePaise: account.initialBalancePaise,
		accountCreatedAt: account.createdAt,
		transactions,
		asOfDate,
		ratePercentPerAnnum: config.ratePercentPerAnnum,
		compoundingFrequency: config.compoundingFrequency,
	});
	await valuationRepo.createValuation(accountId, asOfDate, valuePaise);
	return { valuePaise, asOfDate };
}
