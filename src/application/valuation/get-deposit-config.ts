import type { CompoundingFrequency } from "@/domain/valuation/types";
import * as accountRepo from "@/infrastructure/prisma/account-repository";
import * as rateRepo from "@/infrastructure/prisma/interest-rate-config-repository";

export async function getDepositConfig(
	accountId: string,
): Promise<{
	ratePercentPerAnnum: number;
	compoundingFrequency: CompoundingFrequency;
} | null> {
	const account = await accountRepo.findAccountById(accountId);
	if (!account) return null;
	return rateRepo.findDepositConfigForAccount(accountId);
}
