/**
 * Use case: process a natural language question about the portfolio.
 * Injects portfolio context and returns LLM answer text.
 */

import {
	buildAccountSummary,
	buildAllocationSummary,
	formatPercent,
	paiseToINR,
} from "@/application/insights/snapshot-formatter";
import type { LLMGatewayPort } from "@/domain/insights/llm-gateway";
import { PROMPT_TEMPLATES } from "@/domain/insights/prompt-templates";
import type { NLQueryResult, PortfolioSnapshot } from "@/domain/insights/types";

export const MAX_QUESTION_LENGTH = 1000;

export class NLQueryValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "NLQueryValidationError";
	}
}

export async function processNLQuery(
	question: string,
	snapshot: PortfolioSnapshot,
	gateway: LLMGatewayPort,
): Promise<NLQueryResult> {
	const trimmed = question.trim();
	if (!trimmed) {
		throw new NLQueryValidationError("question must not be empty");
	}
	if (trimmed.length > MAX_QUESTION_LENGTH) {
		throw new NLQueryValidationError(
			`question must be at most ${MAX_QUESTION_LENGTH} characters`,
		);
	}

	const prompt = PROMPT_TEMPLATES.query({
		question: trimmed,
		totalValueINR: paiseToINR(snapshot.totalValuePaise),
		netInvestedINR: paiseToINR(snapshot.netInvestedPaise),
		percentReturn: formatPercent(snapshot.percentReturn),
		allocationSummary: buildAllocationSummary(snapshot.allocationByType),
		accountSummary: buildAccountSummary(snapshot.accounts),
	});

	const response = await gateway.complete(prompt, { insightType: "query" });
	return { answer: response.text.trim(), modelUsed: response.modelUsed };
}
