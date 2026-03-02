/**
 * LLM Insights domain types (bolt 005-llm-insights).
 * ADR-001: monetary amounts in paise throughout; display conversion only in prompt formatting.
 */

export type InsightType =
	| "summary"
	| "projections"
	| "risk"
	| "rebalancing"
	| "query";

export interface PortfolioSnapshot {
	accounts: Array<{
		type: string;
		name: string;
		currentValuePaise: number;
		totalContributionsPaise: number;
	}>;
	totalValuePaise: number;
	netInvestedPaise: number;
	profitLossPaise: number;
	percentReturn: number | null;
	allocationByType: Record<string, number>; // account type → total value in paise
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
}

export interface NLQueryResult {
	answer: string;
	modelUsed?: string;
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
