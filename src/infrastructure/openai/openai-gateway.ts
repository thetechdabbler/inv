/**
 * OpenAI SDK implementation of LLMGatewayPort (ADR-003).
 * Wraps upstream errors as LLMUnavailableError so routes stay provider-agnostic.
 */

import {
	type LLMCompletionOptions,
	type LLMGatewayPort,
	type LLMResponse,
	LLMUnavailableError,
} from "@/domain/insights/llm-gateway";
import OpenAI, { APIError } from "openai";

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TIMEOUT_MS = 15_000;

export class OpenAIGateway implements LLMGatewayPort {
	private client: OpenAI;

	constructor() {
		this.client = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
			timeout: DEFAULT_TIMEOUT_MS,
		});
	}

	async complete(
		prompt: string,
		options?: LLMCompletionOptions,
	): Promise<LLMResponse> {
		const model = options?.model ?? DEFAULT_MODEL;
		try {
			const response = await this.client.chat.completions.create(
				{
					model,
					messages: [{ role: "user", content: prompt }],
					temperature: 0.3,
					max_tokens: 800,
				},
				{ timeout: options?.timeoutMs ?? DEFAULT_TIMEOUT_MS },
			);
			const text = response.choices[0]?.message?.content ?? "";
			return {
				text,
				modelUsed: response.model,
				promptTokens: response.usage?.prompt_tokens ?? null,
				completionTokens: response.usage?.completion_tokens ?? null,
			};
		} catch (e) {
			if (e instanceof APIError) {
				throw new LLMUnavailableError(
					`OpenAI API error (${e.status}): ${e.message}`,
				);
			}
			throw new LLMUnavailableError("LLM request failed");
		}
	}
}
