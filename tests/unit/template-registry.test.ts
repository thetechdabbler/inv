/**
 * Unit tests for bolt 022: template registry.
 * Tests InsightTemplate registration, getTemplate(), renderTemplate(), and error handling.
 */

import {
	TEMPLATE_REGISTRY,
	UnknownInsightTypeError,
	getTemplate,
	renderTemplate,
} from "@/domain/insights/template-registry";
import type { InsightType } from "@/domain/insights/types";
import { describe, expect, it, vi } from "vitest";

const ALL_TYPES: InsightType[] = [
	"portfolio-summary",
	"future-projections",
	"risk-analysis",
	"rebalancing",
	"natural-language-query",
	"projection-quality-review",
	"retirement-readiness",
];

// ── TEMPLATE_REGISTRY ─────────────────────────────────────────────────────────

describe("TEMPLATE_REGISTRY", () => {
	it("should have all 7 insight types registered", () => {
		expect(Object.keys(TEMPLATE_REGISTRY)).toHaveLength(7);
		for (const type of ALL_TYPES) {
			expect(TEMPLATE_REGISTRY[type]).toBeDefined();
		}
	});

	it("should have isActive=true for all registered templates", () => {
		for (const type of ALL_TYPES) {
			expect(TEMPLATE_REGISTRY[type].isActive).toBe(true);
		}
	});

	it("should have non-empty systemPrompt and userPromptTemplate for all types", () => {
		for (const type of ALL_TYPES) {
			const t = TEMPLATE_REGISTRY[type];
			expect(t.systemPrompt.length).toBeGreaterThan(10);
			expect(t.userPromptTemplate.length).toBeGreaterThan(10);
		}
	});

	it("should have id matching the registry key for all types", () => {
		for (const type of ALL_TYPES) {
			expect(TEMPLATE_REGISTRY[type].id).toBe(type);
		}
	});

	it("should have semver version strings for all types", () => {
		const semverPattern = /^\d+\.\d+\.\d+$/;
		for (const type of ALL_TYPES) {
			expect(TEMPLATE_REGISTRY[type].version).toMatch(semverPattern);
		}
	});
});

// ── getTemplate ───────────────────────────────────────────────────────────────

describe("getTemplate", () => {
	it("should return the correct template for each registered type", () => {
		for (const type of ALL_TYPES) {
			const template = getTemplate(type);
			expect(template.id).toBe(type);
		}
	});

	it("should throw UnknownInsightTypeError for an unregistered type", () => {
		expect(() => getTemplate("not-a-type" as InsightType)).toThrow(
			UnknownInsightTypeError,
		);
	});

	it("should include the unknown type name in the error message", () => {
		expect(() => getTemplate("not-a-type" as InsightType)).toThrow(
			/"not-a-type"/,
		);
	});
});

// ── renderTemplate ────────────────────────────────────────────────────────────

describe("renderTemplate", () => {
	const baseCtx: Record<string, string> = {
		totalValueINR: "5,00,000",
		netInvestedINR: "4,30,000",
		profitLossINR: "70,000",
		percentReturn: "16.3%",
		accountCount: "2",
		accountSummary: "Axis MF (mutual_fund, ₹3,00,000); My PPF (ppf, ₹2,00,000)",
		allocationSummary: "mutual_fund: ₹3,00,000, ppf: ₹2,00,000",
		currentAllocationSummary: "mutual_fund: ₹3,00,000, ppf: ₹2,00,000",
		snapshotAt: "2026-03-04T00:00:00.000Z",
		hasProjections: "false",
		projectionsSummary: "Not available",
		hasEmployment: "false",
		basicSalaryINR: "N/A",
		joiningDate: "N/A",
		gratuityAccountName: "N/A",
		yearsOfService: "N/A",
	};

	it("should return a non-empty combined prompt string", () => {
		const template = getTemplate("portfolio-summary");
		const result = renderTemplate(template, baseCtx);
		expect(result.length).toBeGreaterThan(50);
	});

	it("should include systemPrompt content in output", () => {
		const template = getTemplate("portfolio-summary");
		const result = renderTemplate(template, baseCtx);
		expect(result).toContain("financial advisor");
	});

	it("should substitute {{totalValueINR}} correctly", () => {
		const template = getTemplate("portfolio-summary");
		const result = renderTemplate(template, baseCtx);
		expect(result).toContain("5,00,000");
		expect(result).not.toContain("{{totalValueINR}}");
	});

	it("should resolve {{timeHorizonYears}} in systemPrompt for future-projections", () => {
		const template = getTemplate("future-projections");
		const ctx = { ...baseCtx, timeHorizonYears: "10" };
		const result = renderTemplate(template, ctx);
		expect(result).toContain("10 years");
		expect(result).not.toContain("{{timeHorizonYears}}");
	});

	it("should include {{question}} param in natural-language-query prompt", () => {
		const template = getTemplate("natural-language-query");
		const ctx = { ...baseCtx, question: "What is my XIRR?" };
		const result = renderTemplate(template, ctx);
		expect(result).toContain("What is my XIRR?");
	});

	it("should include {{targetAllocationSection}} param in rebalancing prompt", () => {
		const template = getTemplate("rebalancing");
		const section = "Target allocation: equity: 60%, debt: 40%";
		const ctx = { ...baseCtx, targetAllocationSection: section };
		const result = renderTemplate(template, ctx);
		expect(result).toContain("equity: 60%");
	});

	it("should resolve to empty string and warn for unknown placeholders", () => {
		const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const template = getTemplate("portfolio-summary");
		// Remove a key that the template uses
		const { accountSummary: _, ...ctxWithout } = baseCtx;
		const result = renderTemplate(template, ctxWithout);
		expect(result).not.toContain("{{accountSummary}}");
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining("accountSummary"),
		);
		consoleSpy.mockRestore();
	});

	it("should not leave any unresolved {{placeholders}} when given a full context", () => {
		const placeholderPattern = /\{\{\w+\}\}/;
		for (const type of [
			"portfolio-summary",
			"risk-analysis",
			"rebalancing",
		] as const) {
			const template = getTemplate(type);
			const ctx = {
				...baseCtx,
				targetAllocationSection:
					"No target set — suggest a reasonable target.",
			};
			const result = renderTemplate(template, ctx);
			expect(result).not.toMatch(placeholderPattern);
		}
	});

	it("should combine systemPrompt and userPromptTemplate with a blank line", () => {
		const template = getTemplate("portfolio-summary");
		const result = renderTemplate(template, baseCtx);
		// systemPrompt ends with "professional." and userPromptTemplate starts with "Portfolio"
		expect(result).toMatch(/professional\.\n\nPortfolio/);
	});
});

// ── UnknownInsightTypeError ───────────────────────────────────────────────────

describe("UnknownInsightTypeError", () => {
	it("should have the correct name property", () => {
		const err = new UnknownInsightTypeError("bad-type");
		expect(err.name).toBe("UnknownInsightTypeError");
	});

	it("should be an instance of Error", () => {
		const err = new UnknownInsightTypeError("bad-type");
		expect(err).toBeInstanceOf(Error);
	});
});
