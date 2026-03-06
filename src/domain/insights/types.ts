/**
 * LLM Insights domain types (bolt 005-llm-insights).
 * ADR-001: monetary amounts in paise throughout; display conversion only in prompt formatting.
 */

export type InsightType =
	| "portfolio-summary"
	| "future-projections"
	| "risk-analysis"
	| "rebalancing"
	| "natural-language-query"
	| "projection-quality-review"
	| "retirement-readiness";

export interface PortfolioSnapshot {
	accounts: Array<{
		type: string;
		name: string;
		currentValuePaise: number;
		totalContributionsPaise: number;
		/** ISO date string of last valuation, or null if no valuation recorded. */
		lastValuationAt?: string | null;
		/** True when last valuation is older than 30 days or absent. */
		isStale?: boolean;
	}>;
	/** ISO timestamp when this snapshot was assembled. */
	snapshotAt?: string;
	totalValuePaise: number;
	netInvestedPaise: number;
	profitLossPaise: number;
	percentReturn: number | null;
	allocationByType: Record<string, number>; // account type → total value in paise
	/**
	 * Optional deterministic projection data (portfolio scope).
	 * Used to ground LLM projections and commentary.
	 */
	deterministicProjections?: {
		monthly: Array<{ label: string; totalValuePaise: number }>;
		quarterly: Array<{ label: string; totalValuePaise: number }>;
		yearly: Array<{ label: string; totalValuePaise: number }>;
	};
	/**
	 * Optional employment/gratuity context for relevant accounts.
	 */
	employmentContext?: {
		gratuityAccounts: Array<{
			accountId: string;
			accountName: string;
			basicSalaryInr: number | null;
			vpfAmountInr: number | null;
			joiningDate: string | null;
		}>;
	};
}

export type ProjectionScenarioLabel =
	| "optimistic"
	| "expected"
	| "conservative";

export interface ProjectionScenario {
	label: ProjectionScenarioLabel;
	narrative: string;
}

export type RiskSeverity = "high" | "medium" | "low";

export interface RiskFactor {
	severity: RiskSeverity;
	description: string;
	mitigation?: string;
}

export interface SummaryResult {
	summary: string;
	modelUsed?: string;
	disclaimer?: string;
}

export interface ProjectionsResult {
	timeHorizonYears: number;
	optimistic: ProjectionScenario;
	expected: ProjectionScenario;
	conservative: ProjectionScenario;
	modelUsed?: string;
}

export interface RiskResult {
	riskFactors: RiskFactor[];
	modelUsed?: string;
	disclaimer?: string;
}

// Bolt 006 ────────────────────────────────────────────────────────────────────

export interface RebalancingAction {
	accountType: string;
	action: "increase" | "decrease" | "maintain";
	suggestion: string;
}

export interface RebalancingResult {
	actions: RebalancingAction[];
	narrative: string;
	modelUsed?: string;
	disclaimer?: string;
}

export interface NLQueryResult {
	answer: string;
	modelUsed?: string;
	disclaimer?: string;
}

// Bolt 023 ────────────────────────────────────────────────────────────────────

/** Combined output of a projection insight: deterministic series + LLM narrative. */
export interface HybridProjectionResult {
	/** Yearly projection series from the deterministic engine, or null when no projections are available. */
	deterministicData: {
		granularity: "yearly";
		points: Array<{ label: string; totalValuePaise: number }>;
	} | null;
	/** LLM-authored narrative — post-processed and with disclaimer appended. */
	llmNarrative: string;
	/** Qualitative assumptions extracted from or attributed to the LLM response. */
	assumptions: string[];
	/** INSIGHT_DISCLAIMER constant — always present. */
	disclaimer: string;
	modelUsed: string;
}

/** Read-only projection for the debug endpoint — raw audit pair for a single LLM call. */
export interface DebugAuditView {
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

export interface LLMInteractionRecord {
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
