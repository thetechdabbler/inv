/**
 * Unit tests for bolt 023: generateHybridProjection use case.
 */

import { describe, expect, it, vi } from "vitest";
import { INSIGHT_DISCLAIMER } from "@/domain/insights/disclaimer";
import type { LLMGatewayPort, LLMResponse } from "@/domain/insights/llm-gateway";
import type { PortfolioSnapshot } from "@/domain/insights/types";
import { generateHybridProjection } from "@/application/insights/generate-hybrid-projection";

function makeGateway(text: string): LLMGatewayPort {
	return {
		complete: vi.fn().mockResolvedValue({
			text,
			modelUsed: "gpt-4o-mini",
		} satisfies LLMResponse),
	};
}

const baseSnapshot: PortfolioSnapshot = {
	accounts: [
		{
			type: "ppf",
			name: "My PPF",
			currentValuePaise: 200000_00,
			totalContributionsPaise: 180000_00,
		},
	],
	totalValuePaise: 200000_00,
	netInvestedPaise: 180000_00,
	profitLossPaise: 20000_00,
	percentReturn: 11.1,
	allocationByType: { ppf: 200000_00 },
};

const snapshotWithProjections: PortfolioSnapshot = {
	...baseSnapshot,
	deterministicProjections: {
		monthly: [],
		quarterly: [],
		yearly: [
			{ label: "2027", totalValuePaise: 250000_00 },
			{ label: "2028", totalValuePaise: 310000_00 },
		],
	},
};

// ── deterministicData ─────────────────────────────────────────────────────────

describe("generateHybridProjection — deterministicData", () => {
	it("returns null deterministicData when snapshot has no projections", async () => {
		const result = await generateHybridProjection(baseSnapshot, makeGateway("Good outlook."));
		expect(result.deterministicData).toBeNull();
	});

	it("returns yearly projection series when deterministicProjections present", async () => {
		const result = await generateHybridProjection(
			snapshotWithProjections,
			makeGateway("Good outlook."),
		);
		expect(result.deterministicData).not.toBeNull();
		expect(result.deterministicData?.granularity).toBe("yearly");
		expect(result.deterministicData?.points).toHaveLength(2);
		expect(result.deterministicData?.points[0]).toEqual({
			label: "2027",
			totalValuePaise: 250000_00,
		});
	});

	it("deterministicData.points references snapshot yearly data", async () => {
		const result = await generateHybridProjection(
			snapshotWithProjections,
			makeGateway("Narrative text."),
		);
		expect(result.deterministicData?.points).toEqual(
			snapshotWithProjections.deterministicProjections?.yearly,
		);
	});
});

// ── llmNarrative ──────────────────────────────────────────────────────────────

describe("generateHybridProjection — llmNarrative", () => {
	it("includes the LLM response text", async () => {
		const result = await generateHybridProjection(
			baseSnapshot,
			makeGateway("Portfolio is on track for steady growth."),
		);
		expect(result.llmNarrative).toContain("Portfolio is on track for steady growth.");
	});

	it("has disclaimer appended to narrative", async () => {
		const result = await generateHybridProjection(
			baseSnapshot,
			makeGateway("Good portfolio."),
		);
		expect(result.llmNarrative).toContain("⚠️");
		expect(result.llmNarrative).toContain("SEBI");
	});

	it("applies guardrail post-processing to narrative", async () => {
		const result = await generateHybridProjection(
			baseSnapshot,
			makeGateway("You should invest in equity funds for growth."),
		);
		expect(result.llmNarrative).not.toContain("invest in");
		expect(result.llmNarrative).toContain("consider reviewing your allocation");
	});

	it("returns safe fallback narrative when LLM returns empty text", async () => {
		const result = await generateHybridProjection(baseSnapshot, makeGateway(""));
		expect(result.llmNarrative).toContain("financial advisor");
	});
});

// ── disclaimer field ──────────────────────────────────────────────────────────

describe("generateHybridProjection — disclaimer", () => {
	it("always includes disclaimer field equal to INSIGHT_DISCLAIMER", async () => {
		const result = await generateHybridProjection(
			baseSnapshot,
			makeGateway("Some narrative."),
		);
		expect(result.disclaimer).toBe(INSIGHT_DISCLAIMER);
	});

	it("disclaimer is non-empty even when LLM returns empty text", async () => {
		const result = await generateHybridProjection(baseSnapshot, makeGateway("  "));
		expect(result.disclaimer).toBe(INSIGHT_DISCLAIMER);
	});
});

// ── assumptions and modelUsed ─────────────────────────────────────────────────

describe("generateHybridProjection — other fields", () => {
	it("returns empty assumptions array", async () => {
		const result = await generateHybridProjection(
			baseSnapshot,
			makeGateway("Narrative."),
		);
		expect(result.assumptions).toEqual([]);
	});

	it("returns modelUsed from gateway response", async () => {
		const result = await generateHybridProjection(
			baseSnapshot,
			makeGateway("Narrative."),
		);
		expect(result.modelUsed).toBe("gpt-4o-mini");
	});
});

// ── gateway options ───────────────────────────────────────────────────────────

describe("generateHybridProjection — gateway call options", () => {
	it("calls gateway with insightType = projection-quality-review", async () => {
		const gateway: LLMGatewayPort = {
			complete: vi.fn().mockResolvedValue({ text: "Narrative.", modelUsed: "gpt-4o-mini" }),
		};
		await generateHybridProjection(baseSnapshot, gateway);
		expect(gateway.complete).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ insightType: "projection-quality-review" }),
		);
	});

	it("passes templateId and templateVersion to gateway", async () => {
		const gateway: LLMGatewayPort = {
			complete: vi.fn().mockResolvedValue({ text: "Narrative.", modelUsed: "gpt-4o-mini" }),
		};
		await generateHybridProjection(baseSnapshot, gateway);
		expect(gateway.complete).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				templateId: expect.any(String),
				templateVersion: expect.any(String),
			}),
		);
	});
});
