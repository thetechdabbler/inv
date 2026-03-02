/**
 * Builds a PortfolioSnapshot by aggregating data from portfolio-core.
 * Provides the inbound port for LLM insight use cases.
 */

import { getPortfolioPerformance } from "@/application/portfolio/get-portfolio-performance";
import { listAccounts } from "@/application/portfolio/list-accounts";
import type { PortfolioSnapshot } from "@/domain/insights/types";

export async function buildPortfolioSnapshot(): Promise<PortfolioSnapshot> {
	const [accounts, performance] = await Promise.all([
		listAccounts(),
		getPortfolioPerformance(),
	]);

	const allocationByType: Record<string, number> = {};
	for (const account of accounts) {
		allocationByType[account.type] =
			(allocationByType[account.type] ?? 0) + account.currentValuePaise;
	}

	return {
		accounts: accounts.map((a) => ({
			type: a.type,
			name: a.name,
			currentValuePaise: a.currentValuePaise,
			totalContributionsPaise: a.totalContributionsPaise,
		})),
		totalValuePaise: performance.currentValuePaise,
		netInvestedPaise: performance.netInvestedPaise,
		profitLossPaise: performance.profitLossPaise,
		percentReturn: performance.percentReturn,
		allocationByType,
	};
}
