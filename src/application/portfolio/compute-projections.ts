import { getAccountPerformance } from "@/application/portfolio/get-account-performance";
import { listAccounts } from "@/application/portfolio/list-accounts";
import type {
	ProjectionPoint,
	ProjectionsResponse,
	ProjectionScope,
} from "@/types/api";

export interface ComputeProjectionsInput {
	scope: ProjectionScope;
	accountId?: string;
	horizonMonths: number;
	horizonYearsQoq: number;
	horizonYearsYoy: number;
}

function clampHorizon(value: number, fallback: number, min: number, max: number) {
	if (!Number.isFinite(value)) return fallback;
	return Math.min(Math.max(value, min), max);
}

function addMonths(date: Date, months: number) {
	const d = new Date(date);
	d.setMonth(d.getMonth() + months);
	return d;
}

function addYears(date: Date, years: number) {
	const d = new Date(date);
	d.setFullYear(d.getFullYear() + years);
	return d;
}

function formatMonthLabel(d: Date) {
	return d.toLocaleString("en-IN", { month: "short", year: "numeric" });
}

function formatQuarterLabel(d: Date) {
	const month = d.getMonth(); // 0-based
	const quarter = Math.floor(month / 3) + 1;
	return `${d.getFullYear()} Q${quarter}`;
}

function formatYearLabel(d: Date) {
	return d.getFullYear().toString();
}

interface EngineInput {
	currentValuePaise: number;
	netInvestedPaise: number;
	expectedRatePercent: number | null | undefined;
	expectedMonthlyInvestPaise: number | null | undefined;
}

function runDeterministicEngine(
	now: Date,
	months: number,
	yearsQoq: number,
	yearsYoy: number,
	input: EngineInput,
) {
	const {
		currentValuePaise,
		netInvestedPaise,
		expectedRatePercent,
		expectedMonthlyInvestPaise,
	} = input;

	const annualRate =
		typeof expectedRatePercent === "number" && Number.isFinite(expectedRatePercent)
			? expectedRatePercent / 100
			: 0;
	const monthlyContribution =
		typeof expectedMonthlyInvestPaise === "number" &&
		Number.isFinite(expectedMonthlyInvestPaise) &&
		expectedMonthlyInvestPaise > 0
			? expectedMonthlyInvestPaise
			: 0;

	const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

	const monthlyPoints: ProjectionPoint[] = [];
	const quarterlyPoints: ProjectionPoint[] = [];
	const yearlyPoints: ProjectionPoint[] = [];

	let value = currentValuePaise;
	let futureContribPaise = 0;

	for (let i = 1; i <= months; i++) {
		const periodEnd = addMonths(now, i);
		// contribution at end of period
		value = Math.round(value * (1 + monthlyRate) + monthlyContribution);
		futureContribPaise += monthlyContribution;
		const investedPaise = netInvestedPaise + futureContribPaise;
		const profitPaise = value - investedPaise;

		monthlyPoints.push({
			label: formatMonthLabel(periodEnd),
			periodEndDate: periodEnd.toISOString(),
			investedPaise,
			profitPaise,
			totalValuePaise: value,
		});
	}

	// Derive QoQ and YoY by sampling from monthly series
	const totalMonthsQoq = yearsQoq * 12;
	const totalMonthsYoy = yearsYoy * 12;

	for (let m = 3; m <= Math.min(months, totalMonthsQoq); m += 3) {
		const point = monthlyPoints[m - 1];
		quarterlyPoints.push({
			...point,
			label: formatQuarterLabel(new Date(point.periodEndDate)),
		});
	}

	for (let m = 12; m <= Math.min(months, totalMonthsYoy); m += 12) {
		const point = monthlyPoints[m - 1];
		yearlyPoints.push({
			...point,
			label: formatYearLabel(new Date(point.periodEndDate)),
		});
	}

	return { monthlyPoints, quarterlyPoints, yearlyPoints };
}

export async function computePortfolioProjections(
	input: ComputeProjectionsInput,
): Promise<ProjectionsResponse> {
	const now = new Date();

	const horizonMonths = clampHorizon(input.horizonMonths, 12, 1, 360);
	const horizonYearsQoq = clampHorizon(input.horizonYearsQoq, 5, 1, 50);
	const horizonYearsYoy = clampHorizon(input.horizonYearsYoy, 30, 1, 100);

	const accounts = await listAccounts();

	if (accounts.length === 0) {
		const empty: ProjectionPoint[] = [];
		return {
			series: {
				monthly: { granularity: "monthly", points: empty },
				quarterly: { granularity: "quarterly", points: empty },
				yearly: { granularity: "yearly", points: empty },
			},
			assumptions: {
				asOfDate: now.toISOString(),
				scope: input.scope,
				accountId: input.accountId,
				annualRatePercent: null,
				monthlyContributionPaise: null,
				horizonMonths,
				horizonYearsQoq,
				horizonYearsYoy,
			},
			disclaimer:
				"Projections are illustrative estimates only and not financial advice.",
		};
	}

	const targetAccounts =
		input.scope === "account" && input.accountId
			? accounts.filter((a) => a.id === input.accountId)
			: accounts;

	if (targetAccounts.length === 0) {
		throw new Error("No matching account found for projections");
	}

	// Aggregate engine inputs across target accounts
	let aggCurrentValue = 0;
	let aggNetInvested = 0;
	let aggWeightedRate = 0;
	let aggMonthlyContrib = 0;

	for (const account of targetAccounts) {
		const perf = await getAccountPerformance(account.id);
		const currentValue = perf.currentValuePaise;
		const netInvested = perf.netInvestedPaise;
		const ratePercent = account.expectedRatePercent ?? 0;
		const monthly = account.expectedMonthlyInvestPaise ?? 0;

		aggCurrentValue += currentValue;
		aggNetInvested += netInvested;
		aggWeightedRate += currentValue * ratePercent;
		aggMonthlyContrib += monthly;
	}

	const effectiveRatePercent =
		aggCurrentValue > 0 ? aggWeightedRate / aggCurrentValue : 0;

	const { monthlyPoints, quarterlyPoints, yearlyPoints } = runDeterministicEngine(
		now,
		horizonMonths,
		horizonYearsQoq,
		horizonYearsYoy,
		{
			currentValuePaise: aggCurrentValue,
			netInvestedPaise: aggNetInvested,
			expectedRatePercent: effectiveRatePercent,
			expectedMonthlyInvestPaise: aggMonthlyContrib,
		},
	);

	return {
		series: {
			monthly: { granularity: "monthly", points: monthlyPoints },
			quarterly: { granularity: "quarterly", points: quarterlyPoints },
			yearly: { granularity: "yearly", points: yearlyPoints },
		},
		assumptions: {
			asOfDate: now.toISOString(),
			scope: input.scope,
			accountId: input.accountId,
			annualRatePercent: effectiveRatePercent,
			monthlyContributionPaise: aggMonthlyContrib || null,
			horizonMonths,
			horizonYearsQoq,
			horizonYearsYoy,
		},
		disclaimer:
			"These projections are deterministic estimates based on your expected rate of return and expected investments. They are not financial advice.",
	};
}

