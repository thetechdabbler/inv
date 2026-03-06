/**
 * Use case: process a natural language question about the portfolio.
 * Injects portfolio context and returns LLM answer text.
 */

import { buildRenderContext } from "@/application/insights/snapshot-formatter";
import {
	INSIGHT_DISCLAIMER,
	appendDisclaimer,
} from "@/domain/insights/disclaimer";
import type { LLMGatewayPort } from "@/domain/insights/llm-gateway";
import { applyPostProcessing } from "@/domain/insights/post-processing";
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
		templateId: template.id,
		templateVersion: template.version,
	});
	const processed = applyPostProcessing(response.text.trim());
	const answer = appendDisclaimer(processed);
	return { answer, modelUsed: response.modelUsed, disclaimer: INSIGHT_DISCLAIMER };
}
