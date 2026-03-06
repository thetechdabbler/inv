/**
 * LLMAuditService: persists LLMQuery + LLMResponse pairs for every LLM call.
 * Used by AuditingLLMGateway (ADR-004).
 */

import * as llmQueryRepo from "@/infrastructure/prisma/llm-query-repository";
import * as llmResponseRepo from "@/infrastructure/prisma/llm-response-repository";

export class LLMAuditService {
	async logQuery(input: {
		insightType: string;
		prompt: string;
		modelRequested: string;
		templateId?: string | null;
		templateVersion?: string | null;
	}): Promise<{ id: string }> {
		return llmQueryRepo.createLLMQuery(input);
	}

	async logResponse(input: {
		queryId: string;
		responseText: string;
		modelUsed: string;
		tokensUsed?: number | null;
		promptTokens?: number | null;
		completionTokens?: number | null;
		durationMs?: number | null;
		success: boolean;
		errorMessage?: string | null;
	}): Promise<void> {
		await llmResponseRepo.createLLMResponse(input);
	}
}
