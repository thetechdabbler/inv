/**
 * Unit tests for bolt 023: AuditingLLMGateway enriched telemetry.
 * Tests durationMs, templateId/Version passthrough, token count capture.
 */

import { describe, expect, it, vi } from "vitest";
import type { LLMAuditService } from "@/application/insights/llm-audit-service";
import type { LLMGatewayPort, LLMResponse } from "@/domain/insights/llm-gateway";
import { LLMUnavailableError } from "@/domain/insights/llm-gateway";
import { AuditingLLMGateway } from "@/infrastructure/openai/auditing-llm-gateway";

function makeInner(response: Partial<LLMResponse> = {}): LLMGatewayPort {
	return {
		complete: vi.fn().mockResolvedValue({
			text: "Some response text.",
			modelUsed: "gpt-4o-mini",
			promptTokens: 120,
			completionTokens: 45,
			...response,
		} satisfies LLMResponse),
	};
}

function makeFailingInner(error: Error): LLMGatewayPort {
	return { complete: vi.fn().mockRejectedValue(error) };
}

function makeAuditService() {
	const logQuery = vi.fn().mockResolvedValue({ id: "q-test-1" });
	const logResponse = vi.fn().mockResolvedValue(undefined);
	return {
		logQuery,
		logResponse,
		service: { logQuery, logResponse } as unknown as LLMAuditService,
	};
}

// ── durationMs ────────────────────────────────────────────────────────────────

describe("AuditingLLMGateway — durationMs", () => {
	it("logResponse receives a positive durationMs", async () => {
		const inner = makeInner();
		const audit = makeAuditService();
		const gateway = new AuditingLLMGateway(inner, audit.service);

		await gateway.complete("prompt");

		const logResponseCall = audit.logResponse.mock.calls[0][0] as {
			durationMs: number;
		};
		expect(logResponseCall.durationMs).toBeGreaterThanOrEqual(0);
		expect(typeof logResponseCall.durationMs).toBe("number");
	});

	it("logResponse receives durationMs even on LLM failure", async () => {
		const inner = makeFailingInner(new LLMUnavailableError("timeout"));
		const audit = makeAuditService();
		const gateway = new AuditingLLMGateway(inner, audit.service);

		await expect(gateway.complete("prompt")).rejects.toThrow(LLMUnavailableError);

		const logResponseCall = audit.logResponse.mock.calls[0][0] as {
			durationMs: number;
		};
		expect(logResponseCall.durationMs).toBeGreaterThanOrEqual(0);
	});
});

// ── templateId / templateVersion ─────────────────────────────────────────────

describe("AuditingLLMGateway — template provenance", () => {
	it("passes templateId and templateVersion to logQuery", async () => {
		const inner = makeInner();
		const audit = makeAuditService();
		const gateway = new AuditingLLMGateway(inner, audit.service);

		await gateway.complete("prompt", {
			insightType: "portfolio-summary",
			templateId: "portfolio-summary",
			templateVersion: "1.0.0",
		});

		expect(audit.logQuery).toHaveBeenCalledWith(
			expect.objectContaining({
				templateId: "portfolio-summary",
				templateVersion: "1.0.0",
			}),
		);
	});

	it("passes null templateId/Version when options have no template fields", async () => {
		const inner = makeInner();
		const audit = makeAuditService();
		const gateway = new AuditingLLMGateway(inner, audit.service);

		await gateway.complete("prompt", { insightType: "portfolio-summary" });

		const logQueryCall = audit.logQuery.mock.calls[0][0] as {
			templateId: unknown;
			templateVersion: unknown;
		};
		// undefined is also acceptable — audit service handles both
		expect(logQueryCall.templateId == null).toBe(true);
		expect(logQueryCall.templateVersion == null).toBe(true);
	});
});

// ── token counts ──────────────────────────────────────────────────────────────

describe("AuditingLLMGateway — token counts", () => {
	it("passes promptTokens and completionTokens to logResponse", async () => {
		const inner = makeInner({ promptTokens: 289, completionTokens: 53 });
		const audit = makeAuditService();
		const gateway = new AuditingLLMGateway(inner, audit.service);

		await gateway.complete("prompt");

		expect(audit.logResponse).toHaveBeenCalledWith(
			expect.objectContaining({
				promptTokens: 289,
				completionTokens: 53,
			}),
		);
	});

	it("passes null token counts when inner gateway returns null", async () => {
		const inner = makeInner({ promptTokens: null, completionTokens: null });
		const audit = makeAuditService();
		const gateway = new AuditingLLMGateway(inner, audit.service);

		await gateway.complete("prompt");

		const logResponseCall = audit.logResponse.mock.calls[0][0] as {
			promptTokens: unknown;
			completionTokens: unknown;
		};
		expect(logResponseCall.promptTokens).toBeNull();
		expect(logResponseCall.completionTokens).toBeNull();
	});
});

// ── error path ────────────────────────────────────────────────────────────────

describe("AuditingLLMGateway — error path", () => {
	it("re-throws LLMUnavailableError after logging", async () => {
		const inner = makeFailingInner(new LLMUnavailableError("upstream error"));
		const audit = makeAuditService();
		const gateway = new AuditingLLMGateway(inner, audit.service);

		await expect(gateway.complete("prompt")).rejects.toThrow(LLMUnavailableError);
		expect(audit.logResponse).toHaveBeenCalledWith(
			expect.objectContaining({ success: false }),
		);
	});

	it("logs success=false with errorMessage on failure", async () => {
		const inner = makeFailingInner(new Error("some error"));
		const audit = makeAuditService();
		const gateway = new AuditingLLMGateway(inner, audit.service);

		await expect(gateway.complete("prompt")).rejects.toThrow();
		expect(audit.logResponse).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				errorMessage: "some error",
			}),
		);
	});
});
