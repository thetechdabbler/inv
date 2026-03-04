/**
 * @deprecated Use `src/domain/insights/template-registry.ts` instead (bolt 022).
 * This file is superseded by the versioned InsightTemplate registry and will be
 * removed once all consumers have been migrated.
 *
 * Prompt templates for LLM insights (bolt 005-llm-insights).
 * Stored as in-memory typed functions for Next.js compatibility.
 * Token-optimised: only aggregate data, no PII, rounded INR values.
 * Projections and risk prompts request JSON responses for reliable parsing.
 */

interface SummaryData {
	totalValueINR: string;
	netInvestedINR: string;
	profitLossINR: string;
	percentReturn: string;
	accountCount: number;
	accountSummary: string;
	allocationSummary: string;
}

interface ProjectionsData {
	timeHorizonYears: number;
	totalValueINR: string;
	netInvestedINR: string;
	allocationSummary: string;
}

interface RiskData {
	totalValueINR: string;
	profitLossINR: string;
	percentReturn: string;
	accountCount: number;
	allocationSummary: string;
}

interface RebalancingData {
	currentAllocationSummary: string;
	totalValueINR: string;
	targetAllocationSummary: string | null;
}

interface NLQueryData {
	question: string;
	totalValueINR: string;
	netInvestedINR: string;
	percentReturn: string;
	allocationSummary: string;
	accountSummary: string;
}

export const PROMPT_TEMPLATES = {
	summary: (d: SummaryData) =>
		`You are a concise financial advisor for an Indian investor. Write a 3-4 sentence portfolio summary covering overall value, performance vs cost, and notable allocation observations. Be factual and professional.

Portfolio snapshot:
- Total value: ₹${d.totalValueINR}
- Net invested: ₹${d.netInvestedINR}
- Profit/Loss: ₹${d.profitLossINR} (${d.percentReturn})
- Accounts (${d.accountCount}): ${d.accountSummary}
- Allocation: ${d.allocationSummary}

Write the portfolio summary now:`,

	projections: (d: ProjectionsData) =>
		`You are a financial advisor for an Indian investor. Project this portfolio's value over ${d.timeHorizonYears} years across three scenarios using typical Indian market returns (equity: optimistic 15%, expected 12%, conservative 8% p.a.; PPF 7.1%; EPF 8.25%; bank deposits 7%).

Portfolio:
- Current value: ₹${d.totalValueINR}
- Net invested: ₹${d.netInvestedINR}
- Allocation: ${d.allocationSummary}

Respond ONLY with valid JSON (no markdown fences):
{"optimistic":{"narrative":"2-3 sentences with projected value and key assumptions"},"expected":{"narrative":"..."},"conservative":{"narrative":"..."}}`,

	risk: (d: RiskData) =>
		`You are a financial advisor for an Indian investor. Identify 2-5 key risk factors in this portfolio.

Portfolio:
- Total value: ₹${d.totalValueINR}
- Profit/Loss: ₹${d.profitLossINR} (${d.percentReturn})
- Accounts: ${d.accountCount}
- Allocation: ${d.allocationSummary}

Respond ONLY with valid JSON (no markdown fences):
{"riskFactors":[{"severity":"high|medium|low","description":"clear risk description","mitigation":"actionable mitigation suggestion"}]}`,

	rebalancing: (d: RebalancingData) => {
		const targetSection = d.targetAllocationSummary
			? `Target allocation: ${d.targetAllocationSummary}`
			: `No target allocation set — suggest a reasonable target for an Indian retail investor.`;
		return `You are a financial advisor for an Indian investor. Recommend rebalancing actions for this portfolio.

Portfolio:
- Total value: ₹${d.totalValueINR}
- Current allocation: ${d.currentAllocationSummary}
- ${targetSection}

Note: PPF and EPF cannot be withdrawn freely before maturity.

Respond ONLY with valid JSON (no markdown fences):
{"actions":[{"accountType":"string","action":"increase|decrease|maintain","suggestion":"specific actionable recommendation"}],"narrative":"2-3 sentence overall rebalancing summary"}`;
	},

	query: (d: NLQueryData) =>
		`You are a knowledgeable financial advisor for an Indian investor. Answer the question below using the portfolio data provided. If the question is not related to the user's portfolio or personal finance, politely redirect to portfolio topics.

Portfolio context:
- Total value: ₹${d.totalValueINR}
- Net invested: ₹${d.netInvestedINR}
- Return: ${d.percentReturn}
- Allocation: ${d.allocationSummary}
- Accounts: ${d.accountSummary}

Question: ${d.question}

Answer concisely and accurately:`,
};
