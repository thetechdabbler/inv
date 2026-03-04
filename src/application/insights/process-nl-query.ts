/**
 * Use case: process a natural language question about the portfolio.
 * Injects portfolio context and returns LLM answer text.
 */

import { buildRenderContext } from "@/application/insights/snapshot-formatter";
import type { LLMGatewayPort } from "@/domain/insights/llm-gateway";
import {
	getTemplate,
	renderTemplate,
} from "@/domain/insights/template-registry";
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

	const template = getTemplate("natural-language-query");
	const prompt = renderTemplate(
		template,
		buildRenderContext(snapshot, { question: trimmed }),
	);
	const response = await gateway.complete(prompt, {
		insightType: "natural-language-query",
	});
	return { answer: response.text.trim(), modelUsed: response.modelUsed };
}
