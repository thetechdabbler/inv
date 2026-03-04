/**
 * Builds a PortfolioSnapshot by aggregating data from portfolio-core and
 * enriching it with deterministic projections and employment/gratuity context.
 * Provides the inbound port for LLM insight use cases.
 */

import { computePortfolioProjections } from "@/application/portfolio/compute-projections";
import { getPortfolioPerformance } from "@/application/portfolio/get-portfolio-performance";
import { listAccounts } from "@/application/portfolio/list-accounts";
import type { PortfolioSnapshot } from "@/domain/insights/types";
import { findByAccountId as findEmploymentByAccountId } from "@/infrastructure/prisma/employment-info-repository";

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

	// Deterministic projections for the whole portfolio (moderate horizons for LLM context).
	const projectionsPromise = computePortfolioProjections({
		scope: "portfolio",
		horizonMonths: 12,
		horizonYearsQoq: 5,
		horizonYearsYoy: 30,
	});

	// Employment/gratuity context for gratuity accounts, if any.
	const gratuityAccounts = accounts.filter((a) => a.type === "gratuity");
	const employmentInfosPromise = Promise.all(
		gratuityAccounts.map(async (acc) => {
			const info = await findEmploymentByAccountId(acc.id);
			return { account: acc, info };
		}),
	);

	const [projections, employmentInfos] = await Promise.all([
		projectionsPromise,
		employmentInfosPromise,
	]);

	const snapshot: PortfolioSnapshot = {
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

	if (projections.series.monthly.points.length > 0) {
		snapshot.deterministicProjections = {
			monthly: projections.series.monthly.points.map((p) => ({
				label: p.label,
				totalValuePaise: p.totalValuePaise,
			})),
			quarterly: projections.series.quarterly.points.map((p) => ({
				label: p.label,
				totalValuePaise: p.totalValuePaise,
			})),
			yearly: projections.series.yearly.points.map((p) => ({
				label: p.label,
				totalValuePaise: p.totalValuePaise,
			})),
		};
	}

	const gratuityEmployment = employmentInfos
		.map(({ account, info }) => {
			if (!info) return null;
			return {
				accountId: account.id,
				accountName: account.name,
				basicSalaryInr: info.basicSalaryInr,
				vpfAmountInr: info.vpfAmountInr,
				joiningDate: info.joiningDate?.toISOString() ?? null,
			};
		})
		.filter((x): x is NonNullable<typeof x> => x !== null);

	if (gratuityEmployment.length > 0) {
		snapshot.employmentContext = {
			gratuityAccounts: gratuityEmployment,
		};
	}

	return snapshot;
}
