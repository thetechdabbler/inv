import * as configRepo from "@/infrastructure/prisma/account-market-config-repository";
import * as accountRepo from "@/infrastructure/prisma/account-repository";

export interface SetMarketConfigInput {
	schemeCode?: string | null;
	ticker?: string | null;
	units?: number | null;
	shares?: number | null;
}

export async function setMarketConfig(
	accountId: string,
	input: SetMarketConfigInput,
): Promise<{
	schemeCode?: string | null;
	ticker?: string | null;
	units?: number | null;
	shares?: number | null;
} | null> {
	const account = await accountRepo.findAccountById(accountId);
	if (!account) return null;
	const row = await configRepo.setMarketConfig(accountId, input);
	return {
		schemeCode: row.schemeCode,
		ticker: row.ticker,
		units: row.units,
		shares: row.shares,
	};
}
