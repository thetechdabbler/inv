import * as configRepo from "@/infrastructure/prisma/account-market-config-repository";
import * as accountRepo from "@/infrastructure/prisma/account-repository";

export async function getMarketConfig(accountId: string): Promise<{
	schemeCode?: string | null;
	ticker?: string | null;
	units?: number | null;
	shares?: number | null;
} | null> {
	const account = await accountRepo.findAccountById(accountId);
	if (!account) return null;
	const config = await configRepo.getMarketConfig(accountId);
	if (!config) return null;
	return {
		schemeCode: config.schemeCode,
		ticker: config.ticker,
		units: config.units,
		shares: config.shares,
	};
}
