/**
 * AuditingLLMGateway: decorator that wraps any LLMGatewayPort and logs every
 * call — including failures — to the audit trail (ADR-004).
 *
 * Route handlers instantiate: new AuditingLLMGateway(new OpenAIGateway(), auditService)
 * Use cases are unaware of auditing.
 */

import type { LLMAuditService } from "@/application/insights/llm-audit-service";
import type {
	LLMCompletionOptions,
	LLMGatewayPort,
	LLMResponse,
} from "@/domain/insights/llm-gateway";

const DEFAULT_MODEL = "gpt-4o-mini";

export class AuditingLLMGateway implements LLMGatewayPort {
	constructor(
		private readonly inner: LLMGatewayPort,
		private readonly auditService: LLMAuditService,
	) {}

	async complete(
		prompt: string,
		options?: LLMCompletionOptions,
	): Promise<LLMResponse> {
		const modelRequested = options?.model ?? DEFAULT_MODEL;
		const insightType = options?.insightType ?? "unknown";

		const query = await this.auditService.logQuery({
			insightType,
			prompt,
			modelRequested,
			templateId: options?.templateId,
			templateVersion: options?.templateVersion,
		});

		const startTime = Date.now();
		try {
			const response = await this.inner.complete(prompt, options);
			const durationMs = Date.now() - startTime;
			await this.auditService.logResponse({
				queryId: query.id,
				responseText: response.text,
				modelUsed: response.modelUsed,
				promptTokens: response.promptTokens,
				completionTokens: response.completionTokens,
				durationMs,
				success: true,
			});
			return response;
		} catch (e) {
			const durationMs = Date.now() - startTime;
			await this.auditService.logResponse({
				queryId: query.id,
				responseText: "",
				modelUsed: modelRequested,
				durationMs,
				success: false,
				errorMessage: e instanceof Error ? e.message : String(e),
			});
			throw e;
		}
	}
}
