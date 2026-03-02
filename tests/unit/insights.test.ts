/**
 * Unit tests for bolt 005-llm-insights.
 * Tests snapshot formatter helpers and use cases (LLM gateway mocked via interface).
 */

import { analyzeRisk } from "@/application/insights/analyze-risk";
import {
	MAX_TIME_HORIZON_YEARS,
	MIN_TIME_HORIZON_YEARS,
	ProjectionsValidationError,
	generateProjections,
} from "@/application/insights/generate-projections";
import { generateSummary } from "@/application/insights/generate-summary";
import type { LLMAuditService } from "@/application/insights/llm-audit-service";
import {
	MAX_QUESTION_LENGTH,
	NLQueryValidationError,
	processNLQuery,
} from "@/application/insights/process-nl-query";
import {
	RebalancingValidationError,
	recommendRebalancing,
} from "@/application/insights/recommend-rebalancing";
import {
	buildAccountSummary,
	buildAllocationSummary,
	formatPercent,
	paiseToINR,
} from "@/application/insights/snapshot-formatter";
import { LLMUnavailableError } from "@/domain/insights/llm-gateway";
import type { LLMGatewayPort } from "@/domain/insights/llm-gateway";
import type { PortfolioSnapshot } from "@/domain/insights/types";
import { AuditingLLMGateway } from "@/infrastructure/openai/auditing-llm-gateway";
import { describe, expect, it, vi } from "vitest";

// ── Shared fixture ────────────────────────────────────────────────────────────

const snapshot: PortfolioSnapshot = {
	accounts: [
		{
			type: "ppf",
			name: "My PPF",
			currentValuePaise: 200000_00,
			totalContributionsPaise: 180000_00,
		},
		{
			type: "mutual_fund",
			name: "Axis MF",
			currentValuePaise: 300000_00,
			totalContributionsPaise: 250000_00,
		},
	],
	totalValuePaise: 500000_00,
	netInvestedPaise: 430000_00,
	profitLossPaise: 70000_00,
	percentReturn: 16.3,
	allocationByType: { ppf: 200000_00, mutual_fund: 300000_00 },
};

function makeMockGateway(
	text: string,
	modelUsed = "gpt-4o-mini",
): LLMGatewayPort {
	return { complete: vi.fn().mockResolvedValue({ text, modelUsed }) };
}

// ── snapshot-formatter ────────────────────────────────────────────────────────

describe("paiseToINR", () => {
	it("should convert paise to rounded INR string", () => {
		expect(paiseToINR(100_00)).toBe("100");
		expect(paiseToINR(100000_00)).toBe("1,00,000");
		expect(paiseToINR(0)).toBe("0");
	});

	it("should round fractional paise", () => {
		expect(paiseToINR(150)).toBe("2"); // 1.5 INR → 2
	});
});

describe("formatPercent", () => {
	it("should format number with one decimal place and % sign", () => {
		expect(formatPercent(16.3)).toBe("16.3%");
		expect(formatPercent(0)).toBe("0.0%");
		expect(formatPercent(-5.5)).toBe("-5.5%");
	});

	it("should return N/A for null", () => {
		expect(formatPercent(null)).toBe("N/A");
	});
});

describe("buildAccountSummary", () => {
	it("should return none for empty array", () => {
		expect(buildAccountSummary([])).toBe("none");
	});

	it("should list accounts sorted by value descending", () => {
		const result = buildAccountSummary(snapshot.accounts);
		// mutual_fund (3L) should come before ppf (2L)
		expect(result.indexOf("Axis MF")).toBeLessThan(result.indexOf("My PPF"));
	});

	it("should cap at 5 and add overflow indicator", () => {
		const accounts = Array.from({ length: 7 }, (_, i) => ({
			type: "ppf",
			name: `Account ${i + 1}`,
			currentValuePaise: (7 - i) * 100_00,
			totalContributionsPaise: 0,
		}));
		const result = buildAccountSummary(accounts);
		expect(result).toContain("+2 more");
	});

	it("should not add overflow indicator for exactly 5 accounts", () => {
		const accounts = Array.from({ length: 5 }, (_, i) => ({
			type: "ppf",
			name: `Account ${i + 1}`,
			currentValuePaise: 10000,
			totalContributionsPaise: 0,
		}));
		expect(buildAccountSummary(accounts)).not.toContain("more");
	});
});

describe("buildAllocationSummary", () => {
	it("should return none for empty allocation", () => {
		expect(buildAllocationSummary({})).toBe("none");
	});

	it("should sort types by value descending", () => {
		const result = buildAllocationSummary(snapshot.allocationByType);
		expect(result.indexOf("mutual_fund")).toBeLessThan(result.indexOf("ppf"));
	});

	it("should include INR values in output", () => {
		const result = buildAllocationSummary({ ppf: 100_00 });
		expect(result).toContain("ppf");
		expect(result).toContain("₹");
	});
});

// ── generateSummary ───────────────────────────────────────────────────────────

describe("generateSummary", () => {
	it("should return trimmed summary text and modelUsed", async () => {
		const gateway = makeMockGateway("  Your portfolio looks healthy.  ");
		const result = await generateSummary(snapshot, gateway);
		expect(result.summary).toBe("Your portfolio looks healthy.");
		expect(result.modelUsed).toBe("gpt-4o-mini");
	});

	it("should pass a non-empty prompt to the gateway", async () => {
		const mockComplete = vi.fn().mockResolvedValue({
			text: "ok",
			modelUsed: "gpt-4o-mini",
		});
		const gateway: LLMGatewayPort = { complete: mockComplete };
		await generateSummary(snapshot, gateway);
		const [prompt] = mockComplete.mock.calls[0] as [string];
		expect(prompt.length).toBeGreaterThan(50);
		expect(prompt).toContain("₹");
	});

	it("should propagate LLMUnavailableError from gateway", async () => {
		const gateway: LLMGatewayPort = {
			complete: vi.fn().mockRejectedValue(new LLMUnavailableError("API down")),
		};
		await expect(generateSummary(snapshot, gateway)).rejects.toThrow(
			LLMUnavailableError,
		);
	});
});

// ── generateProjections ───────────────────────────────────────────────────────

const validProjectionsJson = JSON.stringify({
	optimistic: { narrative: "In 10 years your portfolio could reach ₹20L." },
	expected: { narrative: "Expected: ₹15L." },
	conservative: { narrative: "Conservative: ₹10L." },
});

describe("generateProjections", () => {
	it("should throw ProjectionsValidationError for out-of-range timeHorizon", async () => {
		const gateway = makeMockGateway(validProjectionsJson);
		await expect(
			generateProjections(snapshot, MIN_TIME_HORIZON_YEARS - 1, gateway),
		).rejects.toThrow(ProjectionsValidationError);
		await expect(
			generateProjections(snapshot, MAX_TIME_HORIZON_YEARS + 1, gateway),
		).rejects.toThrow(ProjectionsValidationError);
	});

	it("should throw ProjectionsValidationError for non-integer timeHorizon", async () => {
		const gateway = makeMockGateway(validProjectionsJson);
		await expect(generateProjections(snapshot, 1.5, gateway)).rejects.toThrow(
			ProjectionsValidationError,
		);
	});

	it("should parse valid JSON and return all three scenarios", async () => {
		const gateway = makeMockGateway(validProjectionsJson);
		const result = await generateProjections(snapshot, 10, gateway);
		expect(result.timeHorizonYears).toBe(10);
		expect(result.optimistic.label).toBe("optimistic");
		expect(result.optimistic.narrative).toContain("₹20L");
		expect(result.expected.label).toBe("expected");
		expect(result.conservative.label).toBe("conservative");
		expect(result.modelUsed).toBe("gpt-4o-mini");
	});

	it("should strip markdown fences from LLM response", async () => {
		const fenced = `\`\`\`json\n${validProjectionsJson}\n\`\`\``;
		const gateway = makeMockGateway(fenced);
		const result = await generateProjections(snapshot, 5, gateway);
		expect(result.optimistic.narrative).toContain("₹20L");
	});

	it("should throw when LLM returns invalid JSON", async () => {
		const gateway = makeMockGateway("not valid json");
		await expect(generateProjections(snapshot, 5, gateway)).rejects.toThrow();
	});

	it("should throw when a scenario is missing", async () => {
		const incomplete = JSON.stringify({
			optimistic: { narrative: "Op" },
			expected: { narrative: "Ex" },
			// missing conservative
		});
		const gateway = makeMockGateway(incomplete);
		await expect(generateProjections(snapshot, 5, gateway)).rejects.toThrow(
			/Missing or invalid scenario/,
		);
	});

	it("should propagate LLMUnavailableError", async () => {
		const gateway: LLMGatewayPort = {
			complete: vi.fn().mockRejectedValue(new LLMUnavailableError("API down")),
		};
		await expect(generateProjections(snapshot, 10, gateway)).rejects.toThrow(
			LLMUnavailableError,
		);
	});
});

// ── analyzeRisk ───────────────────────────────────────────────────────────────

const validRiskJson = JSON.stringify({
	riskFactors: [
		{
			severity: "high",
			description: "Equity concentration in mutual funds",
			mitigation: "Diversify into debt instruments",
		},
		{
			severity: "medium",
			description: "Low liquidity in PPF",
			mitigation: "Maintain emergency fund separately",
		},
	],
});

describe("analyzeRisk", () => {
	it("should return parsed risk factors with correct fields", async () => {
		const gateway = makeMockGateway(validRiskJson);
		const result = await analyzeRisk(snapshot, gateway);
		expect(result.riskFactors).toHaveLength(2);
		expect(result.riskFactors[0].severity).toBe("high");
		expect(result.riskFactors[0].description).toBe(
			"Equity concentration in mutual funds",
		);
		expect(result.riskFactors[0].mitigation).toBe(
			"Diversify into debt instruments",
		);
		expect(result.riskFactors[1].severity).toBe("medium");
		expect(result.modelUsed).toBe("gpt-4o-mini");
	});

	it("should accept risk factor without mitigation", async () => {
		const json = JSON.stringify({
			riskFactors: [{ severity: "low", description: "Minor risk" }],
		});
		const gateway = makeMockGateway(json);
		const result = await analyzeRisk(snapshot, gateway);
		expect(result.riskFactors[0].mitigation).toBeUndefined();
	});

	it("should throw on invalid severity value", async () => {
		const json = JSON.stringify({
			riskFactors: [{ severity: "extreme", description: "Very bad" }],
		});
		const gateway = makeMockGateway(json);
		await expect(analyzeRisk(snapshot, gateway)).rejects.toThrow(
			/Invalid severity/,
		);
	});

	it("should throw when riskFactors array is missing", async () => {
		const gateway = makeMockGateway(JSON.stringify({ other: "data" }));
		await expect(analyzeRisk(snapshot, gateway)).rejects.toThrow(
			/Missing riskFactors/,
		);
	});

	it("should strip markdown fences", async () => {
		const fenced = `\`\`\`json\n${validRiskJson}\n\`\`\``;
		const gateway = makeMockGateway(fenced);
		const result = await analyzeRisk(snapshot, gateway);
		expect(result.riskFactors).toHaveLength(2);
	});

	it("should propagate LLMUnavailableError", async () => {
		const gateway: LLMGatewayPort = {
			complete: vi.fn().mockRejectedValue(new LLMUnavailableError("API down")),
		};
		await expect(analyzeRisk(snapshot, gateway)).rejects.toThrow(
			LLMUnavailableError,
		);
	});
});

// ── recommendRebalancing ──────────────────────────────────────────────────────

const validRebalancingJson = JSON.stringify({
	actions: [
		{
			accountType: "mutual_fund",
			action: "increase",
			suggestion: "Increase SIP to boost equity allocation.",
		},
		{
			accountType: "ppf",
			action: "maintain",
			suggestion: "Continue current PPF contributions.",
		},
	],
	narrative: "Your portfolio is debt-heavy. Adding equity can improve returns.",
});

describe("recommendRebalancing — validation", () => {
	it("should throw RebalancingValidationError for empty targetAllocation", async () => {
		const gateway = makeMockGateway(validRebalancingJson);
		await expect(recommendRebalancing(snapshot, {}, gateway)).rejects.toThrow(
			RebalancingValidationError,
		);
	});

	it("should throw RebalancingValidationError when values don't sum to 1.0", async () => {
		const gateway = makeMockGateway(validRebalancingJson);
		await expect(
			recommendRebalancing(snapshot, { equity: 0.5, debt: 0.3 }, gateway),
		).rejects.toThrow(RebalancingValidationError);
	});

	it("should throw RebalancingValidationError when a value is out of range", async () => {
		const gateway = makeMockGateway(validRebalancingJson);
		await expect(
			recommendRebalancing(snapshot, { equity: 1.5 }, gateway),
		).rejects.toThrow(RebalancingValidationError);
	});

	it("should throw RebalancingValidationError for more than 10 entries", async () => {
		const target = Object.fromEntries(
			Array.from({ length: 11 }, (_, i) => [`type${i}`, 1 / 11]),
		);
		const gateway = makeMockGateway(validRebalancingJson);
		await expect(
			recommendRebalancing(snapshot, target, gateway),
		).rejects.toThrow(RebalancingValidationError);
	});
});

describe("recommendRebalancing — parsing", () => {
	it("should return actions and narrative with null target", async () => {
		const gateway = makeMockGateway(validRebalancingJson);
		const result = await recommendRebalancing(snapshot, null, gateway);
		expect(result.actions).toHaveLength(2);
		expect(result.actions[0].accountType).toBe("mutual_fund");
		expect(result.actions[0].action).toBe("increase");
		expect(result.narrative).toContain("debt-heavy");
		expect(result.modelUsed).toBe("gpt-4o-mini");
	});

	it("should return actions with valid targetAllocation", async () => {
		const gateway = makeMockGateway(validRebalancingJson);
		const result = await recommendRebalancing(
			snapshot,
			{ ppf: 0.4, mutual_fund: 0.6 },
			gateway,
		);
		expect(result.actions).toHaveLength(2);
	});

	it("should strip markdown fences from response", async () => {
		const fenced = `\`\`\`json\n${validRebalancingJson}\n\`\`\``;
		const gateway = makeMockGateway(fenced);
		const result = await recommendRebalancing(snapshot, null, gateway);
		expect(result.actions).toHaveLength(2);
	});

	it("should throw on invalid action type in response", async () => {
		const invalid = JSON.stringify({
			actions: [{ accountType: "ppf", action: "sell", suggestion: "Sell PPF" }],
			narrative: "Narrative text",
		});
		const gateway = makeMockGateway(invalid);
		await expect(recommendRebalancing(snapshot, null, gateway)).rejects.toThrow(
			/Invalid action/,
		);
	});

	it("should propagate LLMUnavailableError", async () => {
		const gateway: LLMGatewayPort = {
			complete: vi.fn().mockRejectedValue(new LLMUnavailableError("timeout")),
		};
		await expect(recommendRebalancing(snapshot, null, gateway)).rejects.toThrow(
			LLMUnavailableError,
		);
	});
});

// ── processNLQuery ────────────────────────────────────────────────────────────

describe("processNLQuery — validation", () => {
	it("should throw NLQueryValidationError for empty question", async () => {
		const gateway = makeMockGateway("answer");
		await expect(processNLQuery("  ", snapshot, gateway)).rejects.toThrow(
			NLQueryValidationError,
		);
	});

	it("should throw NLQueryValidationError for question exceeding max length", async () => {
		const gateway = makeMockGateway("answer");
		const longQuestion = "a".repeat(MAX_QUESTION_LENGTH + 1);
		await expect(
			processNLQuery(longQuestion, snapshot, gateway),
		).rejects.toThrow(NLQueryValidationError);
	});
});

describe("processNLQuery — result", () => {
	it("should return trimmed answer and modelUsed", async () => {
		const gateway = makeMockGateway("  Your return is 16.3%.  ");
		const result = await processNLQuery(
			"What is my return?",
			snapshot,
			gateway,
		);
		expect(result.answer).toBe("Your return is 16.3%.");
		expect(result.modelUsed).toBe("gpt-4o-mini");
	});

	it("should include question in the LLM prompt", async () => {
		const mockComplete = vi
			.fn()
			.mockResolvedValue({ text: "ok", modelUsed: "gpt-4o-mini" });
		const gateway: LLMGatewayPort = { complete: mockComplete };
		await processNLQuery("What is my return?", snapshot, gateway);
		const [prompt] = mockComplete.mock.calls[0] as [string];
		expect(prompt).toContain("What is my return?");
	});

	it("should propagate LLMUnavailableError", async () => {
		const gateway: LLMGatewayPort = {
			complete: vi.fn().mockRejectedValue(new LLMUnavailableError("API down")),
		};
		await expect(
			processNLQuery("What is my return?", snapshot, gateway),
		).rejects.toThrow(LLMUnavailableError);
	});
});

// ── AuditingLLMGateway ────────────────────────────────────────────────────────

function makeMockAuditService() {
	return {
		logQuery: vi.fn().mockResolvedValue({ id: "q-123" }),
		logResponse: vi.fn().mockResolvedValue(undefined),
	};
}

describe("AuditingLLMGateway", () => {
	it("should call logQuery and logResponse on success", async () => {
		const inner: LLMGatewayPort = {
			complete: vi
				.fn()
				.mockResolvedValue({ text: "result", modelUsed: "gpt-4o-mini" }),
		};
		const auditService = makeMockAuditService();
		const gateway = new AuditingLLMGateway(
			inner,
			auditService as unknown as LLMAuditService,
		);
		const result = await gateway.complete("my prompt", {
			insightType: "summary",
		});
		expect(result.text).toBe("result");
		expect(auditService.logQuery).toHaveBeenCalledWith(
			expect.objectContaining({ insightType: "summary", prompt: "my prompt" }),
		);
		expect(auditService.logResponse).toHaveBeenCalledWith(
			expect.objectContaining({ queryId: "q-123", success: true }),
		);
	});

	it("should log failure and re-throw on inner error", async () => {
		const error = new Error("inner failed");
		const inner: LLMGatewayPort = {
			complete: vi.fn().mockRejectedValue(error),
		};
		const auditService = makeMockAuditService();
		const gateway = new AuditingLLMGateway(
			inner,
			auditService as unknown as LLMAuditService,
		);
		await expect(gateway.complete("my prompt")).rejects.toThrow("inner failed");
		expect(auditService.logResponse).toHaveBeenCalledWith(
			expect.objectContaining({ success: false, errorMessage: "inner failed" }),
		);
	});

	it("should use default model when no options provided", async () => {
		const inner: LLMGatewayPort = {
			complete: vi
				.fn()
				.mockResolvedValue({ text: "ok", modelUsed: "gpt-4o-mini" }),
		};
		const auditService = makeMockAuditService();
		const gateway = new AuditingLLMGateway(
			inner,
			auditService as unknown as LLMAuditService,
		);
		await gateway.complete("prompt");
		expect(auditService.logQuery).toHaveBeenCalledWith(
			expect.objectContaining({ modelRequested: "gpt-4o-mini" }),
		);
	});
});
