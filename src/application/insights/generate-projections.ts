/**
 * Use case: generate future portfolio value projections (optimistic/expected/conservative).
 * Expects JSON response from LLM; parses and validates before returning.
 */

import {
	buildAllocationSummary,
	paiseToINR,
} from "@/application/insights/snapshot-formatter";
import type { LLMGatewayPort } from "@/domain/insights/llm-gateway";
import { PROMPT_TEMPLATES } from "@/domain/insights/prompt-templates";
import type {
	PortfolioSnapshot,
	ProjectionsResult,
} from "@/domain/insights/types";

export const MIN_TIME_HORIZON_YEARS = 1;
export const MAX_TIME_HORIZON_YEARS = 30;

export class ProjectionsValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ProjectionsValidationError";
	}
}

interface ProjectionsPayload {
	optimistic: { narrative: string };
	expected: { narrative: string };
	conservative: { narrative: string };
}

function parseProjectionsJson(text: string): ProjectionsPayload {
	const cleaned = text
		.replace(/^```(?:json)?\n?/m, "")
		.replace(/\n?```$/m, "")
		.trim();
	const parsed = JSON.parse(cleaned) as unknown;
	if (!parsed || typeof parsed !== "object") {
		throw new Error("Invalid JSON structure");
	}
	const p = parsed as Record<string, unknown>;
	for (const key of ["optimistic", "expected", "conservative"] as const) {
		const s = p[key] as Record<string, unknown> | undefined;
		if (!s || typeof s.narrative !== "string") {
			throw new Error(`Missing or invalid scenario: ${key}`);
		}
	}
	return parsed as ProjectionsPayload;
}

export async function generateProjections(
	snapshot: PortfolioSnapshot,
	timeHorizonYears: number,
	gateway: LLMGatewayPort,
): Promise<ProjectionsResult> {
	if (
		!Number.isInteger(timeHorizonYears) ||
		timeHorizonYears < MIN_TIME_HORIZON_YEARS ||
		timeHorizonYears > MAX_TIME_HORIZON_YEARS
	) {
		throw new ProjectionsValidationError(
			`timeHorizonYears must be an integer between ${MIN_TIME_HORIZON_YEARS} and ${MAX_TIME_HORIZON_YEARS}`,
		);
	}

	const prompt = PROMPT_TEMPLATES.projections({
		timeHorizonYears,
		totalValueINR: paiseToINR(snapshot.totalValuePaise),
		netInvestedINR: paiseToINR(snapshot.netInvestedPaise),
		allocationSummary: buildAllocationSummary(snapshot.allocationByType),
	});

	const response = await gateway.complete(prompt);
	const parsed = parseProjectionsJson(response.text);

	return {
		timeHorizonYears,
		optimistic: { label: "optimistic", narrative: parsed.optimistic.narrative },
		expected: { label: "expected", narrative: parsed.expected.narrative },
		conservative: {
			label: "conservative",
			narrative: parsed.conservative.narrative,
		},
		modelUsed: response.modelUsed,
	};
}
