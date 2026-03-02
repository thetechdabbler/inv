/**
 * Compute EPF valuation and persist as Valuation record.
 */

import { computeEPF } from "@/domain/valuation/epf-calculator";
import { DEFAULT_EPF_RATE } from "@/domain/valuation/types";
import * as accountRepo from "@/infrastructure/prisma/account-repository";
import * as rateRepo from "@/infrastructure/prisma/interest-rate-config-repository";
import * as transactionRepo from "@/infrastructure/prisma/transaction-repository";
import * as valuationRepo from "@/infrastructure/prisma/valuation-repository";

export async function computeEPFValuation(
	accountId: string,
	asOfDate: Date,
): Promise<{ valuePaise: number; asOfDate: Date } | null> {
	const account = await accountRepo.findAccountById(accountId);
	if (!account || account.type !== "epf") return null;
	const transactions = await transactionRepo.findTransactionsByAccountId(
		accountId,
		{ limit: 10000 },
	);
	const ratesByYear = await rateRepo.findAllYearsForAccountType("epf");
	const getRateForYear = (fy: number) =>
		ratesByYear.get(fy) ?? DEFAULT_EPF_RATE;
	const valuePaise = computeEPF({
		initialBalancePaise: account.initialBalancePaise,
		transactions,
		asOfDate,
		getRateForYear,
	});
	await valuationRepo.createValuation(accountId, asOfDate, valuePaise);
	return { valuePaise, asOfDate };
}
