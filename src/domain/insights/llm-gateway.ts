/**
 * LLM Gateway port (ADR-003).
 * Application layer calls this interface; infrastructure provides the OpenAI implementation.
 * Swapping LLM providers requires only a new infrastructure adapter.
 */

export interface LLMResponse {
	text: string;
	modelUsed: string;
	/** Token counts from LLM provider — null when provider does not return usage. */
	promptTokens?: number | null;
	completionTokens?: number | null;
}

export interface LLMCompletionOptions {
	model?: string;
	timeoutMs?: number;
	/** Insight type label written to the audit trail (ADR-004). */
	insightType?: string;
	/** Template provenance — stored in audit record when call originates from renderTemplate(). */
	templateId?: string;
	templateVersion?: string;
}

export interface LLMGatewayPort {
	complete(
		prompt: string,
		options?: LLMCompletionOptions,
	): Promise<LLMResponse>;
}

/**
 * Thrown when the LLM service is unavailable (API key missing, timeout, upstream error).
 * Routes catch this and return 503.
 */
export class LLMUnavailableError extends Error {
	constructor(message = "LLM service unavailable") {
		super(message);
		this.name = "LLMUnavailableError";
	}
}
