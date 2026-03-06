/**
 * API response types for UI (bolt 009).
 * Bolt 023: HybridProjectionResult replaces the LLM-only ProjectionsResponse for /insights/projections.
 */

export interface AuthStatus {
	configured: boolean;
	authenticated?: boolean;
}

export interface AccountListItem {
	id: string;
	type: string;
	name: string;
	description: string | null;
	initialBalancePaise: number;
	expectedRatePercent?: number | null;
	expectedMonthlyInvestPaise?: number | null;
	currentValuePaise?: number;
	totalContributionsPaise?: number;
	createdAt: string;
	updatedAt: string;
}

export interface AccountsResponse {
	accounts: AccountListItem[];
}

export interface PerformanceSnapshot {
	totalContributionsPaise: number;
	totalWithdrawalsPaise: number;
	netInvestedPaise: number;
	currentValuePaise: number;
	profitLossPaise: number;
	percentReturn: number | null;
}

export const ACCOUNT_TYPES = [
	"bank_deposit",
	"stocks",
	"mutual_fund",
	"ppf",
	"epf",
	"nps",
	"gratuity",
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const TRANSACTION_TYPES = ["investment", "withdrawal"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export interface HistoryEntry {
	id: string;
	date: string; // "YYYY-MM-DD"
	type: "investment" | "withdrawal" | "valuation";
	amountOrValuePaise: number;
	description?: string | null;
	createdAt: string;
}

export interface AccountHistoryResponse {
	entries: HistoryEntry[];
	total: number;
}

export interface LLMInteraction {
	id: string;
	insightType: string;
	prompt: string;
	response: string;
	modelUsed: string;
	tokensUsed: number | null;
	success: boolean;
	errorMessage: string | null;
	createdAt: string;
}

export interface InsightsHistoryResponse {
	interactions: LLMInteraction[];
	total: number;
}

export interface InsightsQueryResponse {
	answer: string;
	modelUsed: string;
}

export type ProjectionScope = "portfolio" | "account";

export type ProjectionGranularity = "monthly" | "quarterly" | "yearly";

export interface ProjectionPoint {
	label: string;
	periodEndDate: string;
	investedPaise: number;
	profitPaise: number;
	totalValuePaise: number;
}

export interface ProjectionSeries {
	granularity: ProjectionGranularity;
	points: ProjectionPoint[];
}

export interface ProjectionAssumptions {
	asOfDate: string;
	scope: ProjectionScope;
	accountId?: string;
	annualRatePercent: number | null;
	monthlyContributionPaise: number | null;
	horizonMonths: number;
	horizonYearsQoq: number;
	horizonYearsYoy: number;
}

export interface ProjectionsResponse {
	series: {
		monthly: ProjectionSeries;
		quarterly: ProjectionSeries;
		yearly: ProjectionSeries;
	};
	assumptions: ProjectionAssumptions;
	disclaimer: string;
}

/** Bolt 023: combined deterministic + LLM projection insight. Returned by POST /api/v1/insights/projections. */
export interface HybridProjectionResult {
	/** Yearly projection series from the deterministic engine, or null when no projections are available. */
	deterministicData: {
		granularity: "yearly";
		points: Array<{ label: string; totalValuePaise: number }>;
	} | null;
	/** LLM-authored narrative — post-processed with guardrails and disclaimer appended. */
	llmNarrative: string;
	/** Qualitative assumptions attributed to the LLM response. */
	assumptions: string[];
	/** INSIGHT_DISCLAIMER constant — always present. */
	disclaimer: string;
	modelUsed: string;
}

/** Bolt 023: raw audit pair for a single LLM call. Returned by GET /api/v1/insights/debug/:auditId. */
export interface DebugAuditViewResponse {
	auditId: string;
	insightType: string;
	prompt: string;
	responseText: string;
	modelUsed: string;
	promptTokens: number | null;
	completionTokens: number | null;
	durationMs: number | null;
	templateId: string | null;
	templateVersion: string | null;
	success: boolean;
	errorMessage: string | null;
	createdAt: string;
}
