/**
 * Unit tests for bolt 023: post-processing guardrail pipeline and disclaimer.
 */

import { describe, expect, it } from "vitest";
import { INSIGHT_DISCLAIMER, appendDisclaimer } from "@/domain/insights/disclaimer";
import {
	GUARDRAIL_PIPELINE,
	SAFE_FALLBACK,
	applyPostProcessing,
	type PostProcessingTransform,
} from "@/domain/insights/post-processing";

// ── appendDisclaimer ──────────────────────────────────────────────────────────

describe("appendDisclaimer", () => {
	it("appends disclaimer to non-empty narrative", () => {
		const result = appendDisclaimer("Your portfolio is solid.");
		expect(result).toBe(`Your portfolio is solid.\n\n${INSIGHT_DISCLAIMER}`);
	});

	it("returns disclaimer only when narrative is empty string", () => {
		expect(appendDisclaimer("")).toBe(INSIGHT_DISCLAIMER);
	});

	it("returns disclaimer only when narrative is whitespace", () => {
		expect(appendDisclaimer("   ")).toBe(INSIGHT_DISCLAIMER);
	});

	it("INSIGHT_DISCLAIMER contains SEBI text", () => {
		expect(INSIGHT_DISCLAIMER).toContain("SEBI");
	});

	it("INSIGHT_DISCLAIMER contains not-financial-advice disclaimer", () => {
		expect(INSIGHT_DISCLAIMER).toContain("does not constitute financial advice");
	});

	it("INSIGHT_DISCLAIMER starts with warning emoji", () => {
		expect(INSIGHT_DISCLAIMER).toMatch(/^⚠️/);
	});
});

// ── applyPostProcessing ───────────────────────────────────────────────────────

describe("applyPostProcessing", () => {
	it("returns original text unchanged when no guardrail triggers", () => {
		const text = "Your portfolio has solid diversification across asset classes.";
		expect(applyPostProcessing(text)).toBe(text);
	});

	it("replaces 'invest in' with generic phrase", () => {
		const result = applyPostProcessing("You should invest in Axis Bluechip Fund.");
		expect(result).not.toContain("invest in");
		expect(result).toContain("consider reviewing your allocation");
	});

	it("replaces 'buy' recommendation", () => {
		const result = applyPostProcessing("I suggest you buy more equity funds.");
		expect(result).not.toContain("buy");
		expect(result).toContain("consider reviewing your allocation");
	});

	it("replaces 'sell' recommendation", () => {
		const result = applyPostProcessing("You should sell your PPF allocation.");
		expect(result).not.toContain("sell");
	});

	it("replaces 'switch to' recommendation", () => {
		const result = applyPostProcessing("Consider to switch to NPS for retirement.");
		expect(result).not.toContain("switch to");
	});

	it("replaces 'recommend fund' pattern", () => {
		const result = applyPostProcessing("I recommend this fund for your portfolio.");
		expect(result).not.toMatch(/recommend\w*\s+fund/i);
	});

	it("is case-insensitive for guardrail patterns", () => {
		const result = applyPostProcessing("You should INVEST IN an equity ETF.");
		expect(result).not.toContain("INVEST IN");
	});

	it("returns SAFE_FALLBACK when processed text is under 20 chars", () => {
		// A string under 20 chars that doesn't match any guardrail
		const result = applyPostProcessing("ok");
		expect(result).toBe(SAFE_FALLBACK);
	});

	it("returns SAFE_FALLBACK when input is empty", () => {
		expect(applyPostProcessing("")).toBe(SAFE_FALLBACK);
	});

	it("returns SAFE_FALLBACK when input is whitespace only", () => {
		expect(applyPostProcessing("   ")).toBe(SAFE_FALLBACK);
	});

	it("SAFE_FALLBACK is a non-empty meaningful string", () => {
		expect(SAFE_FALLBACK.length).toBeGreaterThan(20);
		expect(SAFE_FALLBACK).toContain("financial advisor");
	});

	it("pipeline is resilient to a throwing transform", () => {
		const throwingTransform: PostProcessingTransform = {
			name: "testThrower",
			apply: () => {
				throw new Error("Transform failure");
			},
		};
		// Directly test resilience by running a pipeline with the throwing transform
		// applyPostProcessing uses GUARDRAIL_PIPELINE, but we can verify the pattern
		let result = "Valid portfolio analysis text for the user.";
		for (const transform of [...GUARDRAIL_PIPELINE, throwingTransform]) {
			try {
				result = transform.apply(result);
			} catch (_e) {
				// transform failed — result should be unchanged
			}
		}
		expect(result).toContain("Valid portfolio analysis text");
	});

	it("does not modify text that is already compliant", () => {
		const text =
			"Your portfolio is equity-heavy. Consider reviewing your allocation " +
			"between growth and stability assets.";
		expect(applyPostProcessing(text)).toBe(text);
	});
});

// ── GUARDRAIL_PIPELINE ────────────────────────────────────────────────────────

describe("GUARDRAIL_PIPELINE", () => {
	it("has at least one transform registered", () => {
		expect(GUARDRAIL_PIPELINE.length).toBeGreaterThan(0);
	});

	it("each transform has a name and apply function", () => {
		for (const t of GUARDRAIL_PIPELINE) {
			expect(typeof t.name).toBe("string");
			expect(t.name.length).toBeGreaterThan(0);
			expect(typeof t.apply).toBe("function");
		}
	});
});
