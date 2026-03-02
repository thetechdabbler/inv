/**
 * Account market config (scheme code, ticker, units, shares) for bolt 004.
 */

import { prisma } from "./client";

export interface AccountMarketConfigRow {
	accountId: string;
	schemeCode: string | null;
	ticker: string | null;
	units: number | null;
	shares: number | null;
}

export async function getMarketConfig(
	accountId: string,
): Promise<AccountMarketConfigRow | null> {
	const row = await prisma.accountMarketConfig.findUnique({
		where: { accountId },
	});
	if (!row) return null;
	return {
		accountId: row.accountId,
		schemeCode: row.schemeCode,
		ticker: row.ticker,
		units: row.units,
		shares: row.shares,
	};
}

export async function setMarketConfig(
	accountId: string,
	data: {
		schemeCode?: string | null;
		ticker?: string | null;
		units?: number | null;
		shares?: number | null;
	},
): Promise<AccountMarketConfigRow> {
	const row = await prisma.accountMarketConfig.upsert({
		where: { accountId },
		create: {
			accountId,
			schemeCode: data.schemeCode ?? null,
			ticker: data.ticker ?? null,
			units: data.units ?? null,
			shares: data.shares ?? null,
		},
		update: {
			...(data.schemeCode !== undefined && { schemeCode: data.schemeCode }),
			...(data.ticker !== undefined && { ticker: data.ticker }),
			...(data.units !== undefined && { units: data.units }),
			...(data.shares !== undefined && { shares: data.shares }),
		},
	});
	return {
		accountId: row.accountId,
		schemeCode: row.schemeCode,
		ticker: row.ticker,
		units: row.units,
		shares: row.shares,
	};
}
