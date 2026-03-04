/**
 * Use case: generate rebalancing recommendations from current vs target allocation.
 * Expects JSON response with actions array + narrative.
 */

import { buildRenderContext } from "@/application/insights/snapshot-formatter";
import type { LLMGatewayPort } from "@/domain/insights/llm-gateway";
import {
	getTemplate,
	renderTemplate,
} from "@/domain/insights/template-registry";
import type {
	PortfolioSnapshot,
	RebalancingAction,
	RebalancingResult,
} from "@/domain/insights/types";

export class RebalancingValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "RebalancingValidationError";
	}
}

const VALID_ACTIONS = ["increase", "decrease", "maintain"] as const;
type ActionType = (typeof VALID_ACTIONS)[number];

/** Validate target allocation: values must be 0–1 and sum to ~1.0. */
function validateTargetAllocation(
	target: Record<string, number>,
): RebalancingValidationError | null {
	const entries = Object.entries(target);
	if (entries.length === 0) {
		return new RebalancingValidationError(
			"targetAllocation must have at least one entry",
		);
	}
	if (entries.length > 10) {
		return new RebalancingValidationError(
			"targetAllocation must have at most 10 entries",
		);
	}
	for (const [type, pct] of entries) {
		if (typeof pct !== "number" || pct < 0 || pct > 1) {
			return new RebalancingValidationError(
				`targetAllocation["${type}"] must be a number between 0 and 1`,
			);
		}
	}
	const sum = entries.reduce((acc, [, v]) => acc + v, 0);
	if (Math.abs(sum - 1) > 0.01) {
		return new RebalancingValidationError(
			`targetAllocation values must sum to 1.0 (got ${sum.toFixed(3)})`,
		);
	}
	return null;
}

interface RebalancingPayload {
	actions: Array<{ accountType: string; action: string; suggestion: string }>;
	narrative: string;
}

function parseRebalancingJson(text: string): RebalancingPayload {
	const cleaned = text
		.replace(/^```(?:json)?\n?/m, "")
		.replace(/\n?```$/m, "")
		.trim();
	const parsed = JSON.parse(cleaned) as unknown;
	if (!parsed || typeof parsed !== "object") {
		throw new Error("Invalid JSON structure");
	}
	const p = parsed as Record<string, unknown>;
	if (!Array.isArray(p.actions)) {
		throw new Error("Missing actions array");
	}
	if (typeof p.narrative !== "string" || !p.narrative.trim()) {
		throw new Error("Missing narrative");
	}
	const actions = p.actions.map((item: unknown, i: number) => {
		if (!item || typeof item !== "object") {
			throw new Error(`Invalid action at index ${i}`);
		}
		const a = item as Record<string, unknown>;
		if (!VALID_ACTIONS.includes(a.action as ActionType)) {
			throw new Error(`Invalid action at index ${i}: ${String(a.action)}`);
		}
		if (typeof a.accountType !== "string") {
			throw new Error(`Missing accountType at index ${i}`);
		}
		if (typeof a.suggestion !== "string") {
			throw new Error(`Missing suggestion at index ${i}`);
		}
		return {
			accountType: a.accountType,
			action: a.action as ActionType,
			suggestion: a.suggestion,
		};
	});
	return { actions, narrative: p.narrative };
}

export async function recommendRebalancing(
	snapshot: PortfolioSnapshot,
	targetAllocation: Record<string, number> | null,
	gateway: LLMGatewayPort,
): Promise<RebalancingResult> {
	if (targetAllocation !== null) {
		const err = validateTargetAllocation(targetAllocation);
		if (err) throw err;
	}

	const targetAllocationSummary = targetAllocation
		? Object.entries(targetAllocation)
				.map(([type, pct]) => `${type}: ${Math.round(pct * 100)}%`)
				.join(", ")
		: null;
	const targetAllocationSection = targetAllocationSummary
		? `Target allocation: ${targetAllocationSummary}`
		: "No target allocation set — suggest a reasonable target for an Indian retail investor.";

	const template = getTemplate("rebalancing");
	const prompt = renderTemplate(
		template,
		buildRenderContext(snapshot, { targetAllocationSection }),
	);
	const response = await gateway.complete(prompt, { insightType: "rebalancing" });
	const parsed = parseRebalancingJson(response.text);

	return {
		actions: parsed.actions as RebalancingAction[],
		narrative: parsed.narrative,
		modelUsed: response.modelUsed,
	};
}
