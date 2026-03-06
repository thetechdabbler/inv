/**
 * Use case: identify portfolio risk factors via LLM.
 * Expects JSON response; parses and validates severity/description/mitigation.
 */

import { buildRenderContext } from "@/application/insights/snapshot-formatter";
import {
	INSIGHT_DISCLAIMER,
} from "@/domain/insights/disclaimer";
import type { LLMGatewayPort } from "@/domain/insights/llm-gateway";
import { applyPostProcessing } from "@/domain/insights/post-processing";
import {
	getTemplate,
	renderTemplate,
} from "@/domain/insights/template-registry";
import type {
	PortfolioSnapshot,
	RiskFactor,
	RiskResult,
	RiskSeverity,
} from "@/domain/insights/types";

const VALID_SEVERITIES: RiskSeverity[] = ["high", "medium", "low"];

function parseRiskJson(text: string): RiskFactor[] {
	const cleaned = text
		.replace(/^```(?:json)?\n?/m, "")
		.replace(/\n?```$/m, "")
		.trim();
	const parsed = JSON.parse(cleaned) as unknown;
	if (!parsed || typeof parsed !== "object") {
		throw new Error("Invalid JSON structure");
	}
	const p = parsed as Record<string, unknown>;
	if (!Array.isArray(p.riskFactors)) {
		throw new Error("Missing riskFactors array");
	}
	return p.riskFactors.map((item: unknown, i: number) => {
		if (!item || typeof item !== "object") {
			throw new Error(`Invalid risk factor at index ${i}`);
		}
		const f = item as Record<string, unknown>;
		if (!VALID_SEVERITIES.includes(f.severity as RiskSeverity)) {
			throw new Error(`Invalid severity at index ${i}: ${String(f.severity)}`);
		}
		if (typeof f.description !== "string" || !f.description.trim()) {
			throw new Error(`Missing description at index ${i}`);
		}
		return {
			severity: f.severity as RiskSeverity,
			description: f.description,
			mitigation: typeof f.mitigation === "string" ? f.mitigation : undefined,
		};
	});
}

export async function analyzeRisk(
	snapshot: PortfolioSnapshot,
	gateway: LLMGatewayPort,
): Promise<RiskResult> {
	const template = getTemplate("risk-analysis");
	const prompt = renderTemplate(template, buildRenderContext(snapshot));
	const response = await gateway.complete(prompt, {
		insightType: "risk-analysis",
		templateId: template.id,
		templateVersion: template.version,
	});
	const riskFactors = parseRiskJson(response.text);
	// Post-processing applies to string fields only — not the full JSON blob
	const processed = riskFactors.map((f) => ({
		...f,
		description: applyPostProcessing(f.description),
		mitigation: f.mitigation ? applyPostProcessing(f.mitigation) : undefined,
	}));
	return { riskFactors: processed, modelUsed: response.modelUsed, disclaimer: INSIGHT_DISCLAIMER };
}
