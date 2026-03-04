/**
 * Versioned prompt template registry for all LLM insight types (bolt 022).
 * Templates are in-memory TypeScript objects — no DB or file backing.
 *
 * Usage:
 *   const template = getTemplate("portfolio-summary");
 *   const ctx = buildRenderContext(snapshot, params); // application layer
 *   const prompt = renderTemplate(template, ctx);
 *   await gateway.complete(prompt, { insightType: template.id });
 */

import type { InsightType } from "@/domain/insights/types";

export interface InsightTemplate {
	id: InsightType;
	version: string;
	isActive: boolean;
	/** Role/persona instruction prepended to the user prompt. */
	systemPrompt: string;
	/** User-facing prompt with {{variable}} placeholders resolved at render time. */
	userPromptTemplate: string;
	/** Human-readable description of expected output structure. Not enforced at runtime. */
	outputSchema: Record<string, string>;
}

/** Thrown when the registry is queried for an unregistered or unknown insight type. */
export class UnknownInsightTypeError extends Error {
	constructor(type: string) {
		super(`No template registered for insight type: "${type}"`);
		this.name = "UnknownInsightTypeError";
	}
}

// ── Template definitions ──────────────────────────────────────────────────────

export const TEMPLATE_REGISTRY: Record<InsightType, InsightTemplate> = {
	"portfolio-summary": {
		id: "portfolio-summary",
		version: "1.0.0",
		isActive: true,
		systemPrompt:
			"You are a concise financial advisor for an Indian investor. Write a 3-4 sentence portfolio summary covering overall value, performance vs cost, and notable allocation observations. Be factual and professional.",
		userPromptTemplate: `Portfolio snapshot:
- Total value: ₹{{totalValueINR}}
- Net invested: ₹{{netInvestedINR}}
- Profit/Loss: ₹{{profitLossINR}} ({{percentReturn}})
- Accounts ({{accountCount}}): {{accountSummary}}
- Allocation: {{allocationSummary}}

Write the portfolio summary now:`,
		outputSchema: { summary: "string" },
	},

	"future-projections": {
		id: "future-projections",
		version: "1.0.0",
		isActive: true,
		systemPrompt:
			"You are a financial advisor for an Indian investor. Project this portfolio's value over {{timeHorizonYears}} years across three scenarios using typical Indian market returns (equity: optimistic 15%, expected 12%, conservative 8% p.a.; PPF 7.1%; EPF 8.25%; bank deposits 7%).",
		userPromptTemplate: `Portfolio:
- Current value: ₹{{totalValueINR}}
- Net invested: ₹{{netInvestedINR}}
- Allocation: {{allocationSummary}}

Respond ONLY with valid JSON (no markdown fences):
{"optimistic":{"narrative":"2-3 sentences with projected value and key assumptions"},"expected":{"narrative":"..."},"conservative":{"narrative":"..."}}`,
		outputSchema: {
			optimistic: "{ narrative: string }",
			expected: "{ narrative: string }",
			conservative: "{ narrative: string }",
		},
	},

	"risk-analysis": {
		id: "risk-analysis",
		version: "1.0.0",
		isActive: true,
		systemPrompt:
			"You are a financial advisor for an Indian investor. Identify 2-5 key risk factors in this portfolio.",
		userPromptTemplate: `Portfolio:
- Total value: ₹{{totalValueINR}}
- Profit/Loss: ₹{{profitLossINR}} ({{percentReturn}})
- Accounts: {{accountCount}}
- Allocation: {{allocationSummary}}

Respond ONLY with valid JSON (no markdown fences):
{"riskFactors":[{"severity":"high|medium|low","description":"clear risk description","mitigation":"actionable mitigation suggestion"}]}`,
		outputSchema: {
			riskFactors:
				"Array<{ severity: 'high'|'medium'|'low', description: string, mitigation?: string }>",
		},
	},

	rebalancing: {
		id: "rebalancing",
		version: "1.0.0",
		isActive: true,
		systemPrompt:
			"You are a financial advisor for an Indian investor. Recommend rebalancing actions for this portfolio.",
		userPromptTemplate: `Portfolio:
- Total value: ₹{{totalValueINR}}
- Current allocation: {{currentAllocationSummary}}
- {{targetAllocationSection}}

Note: PPF and EPF cannot be withdrawn freely before maturity.

Respond ONLY with valid JSON (no markdown fences):
{"actions":[{"accountType":"string","action":"increase|decrease|maintain","suggestion":"specific actionable recommendation"}],"narrative":"2-3 sentence overall rebalancing summary"}`,
		outputSchema: {
			actions:
				"Array<{ accountType: string, action: 'increase'|'decrease'|'maintain', suggestion: string }>",
			narrative: "string",
		},
	},

	"natural-language-query": {
		id: "natural-language-query",
		version: "1.0.0",
		isActive: true,
		systemPrompt:
			"You are a knowledgeable financial advisor for an Indian investor. Answer the question below using the portfolio data provided. If the question is not related to the user's portfolio or personal finance, politely redirect to portfolio topics.",
		userPromptTemplate: `Portfolio context:
- Total value: ₹{{totalValueINR}}
- Net invested: ₹{{netInvestedINR}}
- Return: {{percentReturn}}
- Allocation: {{allocationSummary}}
- Accounts: {{accountSummary}}

Question: {{question}}

Answer concisely and accurately:`,
		outputSchema: { answer: "string" },
	},

	"projection-quality-review": {
		id: "projection-quality-review",
		version: "1.0.0",
		isActive: true,
		systemPrompt:
			"You are a financial analyst for an Indian retail investor. Review the deterministic portfolio projections and provide a brief qualitative assessment.",
		userPromptTemplate: `Projection data (next 3 years, deterministic):
{{projectionsSummary}}

Portfolio:
- Current value: ₹{{totalValueINR}}
- Allocation: {{allocationSummary}}

Assess in 3-4 sentences: (1) Are these projected rates reasonable for Indian markets? (2) What risks could cause deviation? (3) What caveats should the investor note?`,
		outputSchema: { assessment: "string" },
	},

	"retirement-readiness": {
		id: "retirement-readiness",
		version: "1.0.0",
		isActive: true,
		systemPrompt:
			"You are a retirement planning advisor for an Indian investor. Assess retirement readiness based on the employment, gratuity, and portfolio data provided.",
		userPromptTemplate: `Employment details:
- Years of service: {{yearsOfService}}
- Monthly basic salary: ₹{{basicSalaryINR}}
- Joining date: {{joiningDate}}
- Gratuity account: {{gratuityAccountName}}

Portfolio:
- Total value: ₹{{totalValueINR}}
- Allocation: {{allocationSummary}}

Provide a 3-4 sentence retirement readiness assessment covering: (1) whether current savings appear adequate for retirement, (2) gratuity timeline and expected benefit, (3) key recommendations.`,
		outputSchema: { assessment: "string" },
	},
};

// ── Registry functions ────────────────────────────────────────────────────────

/**
 * Returns the active template for the given insight type.
 * Throws UnknownInsightTypeError if the type is not registered.
 */
export function getTemplate(type: InsightType): InsightTemplate {
	const template = TEMPLATE_REGISTRY[type];
	if (!template) throw new UnknownInsightTypeError(type);
	return template;
}

/**
 * Renders a template by substituting {{variable}} placeholders with values
 * from the provided context. Resolves placeholders in both systemPrompt and
 * userPromptTemplate, then returns the full combined prompt string.
 *
 * Unresolved placeholders resolve to "" with a console.warn (non-fatal).
 */
export function renderTemplate(
	template: InsightTemplate,
	ctx: Record<string, string>,
): string {
	const resolve = (text: string): string =>
		text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
			if (key in ctx) return ctx[key];
			console.warn(
				`[template-registry] Unresolved placeholder: {{${key}}} in ${template.id}@${template.version}`,
			);
			return "";
		});

	return `${resolve(template.systemPrompt)}\n\n${resolve(template.userPromptTemplate)}`;
}
