/**
 * POST /api/v1/insights/projections
 * Generate future portfolio value projections (optimistic/expected/conservative).
 * Body: { timeHorizonYears: number } — integer 1–30.
 */

import {
	MAX_TIME_HORIZON_YEARS,
	MIN_TIME_HORIZON_YEARS,
	ProjectionsValidationError,
	generateProjections,
} from "@/application/insights/generate-projections";
import { LLMAuditService } from "@/application/insights/llm-audit-service";
import { buildPortfolioSnapshot } from "@/application/insights/snapshot-builder";
import { LLMUnavailableError } from "@/domain/insights/llm-gateway";
import { AuditingLLMGateway } from "@/infrastructure/openai/auditing-llm-gateway";
import { OpenAIGateway } from "@/infrastructure/openai/openai-gateway";
import { NextResponse } from "next/server";

function validationError(message: string) {
	return NextResponse.json(
		{ code: "VALIDATION_ERROR", message },
		{ status: 400 },
	);
}

export async function POST(request: Request) {
	if (!process.env.OPENAI_API_KEY) {
		return NextResponse.json(
			{
				code: "SERVICE_UNAVAILABLE",
				message: "Insights temporarily unavailable",
			},
			{ status: 503 },
		);
	}

	try {
		const body = (await request.json()) as unknown;
		if (!body || typeof body !== "object") {
			return validationError("Request body must be a JSON object");
		}
		const { timeHorizonYears } = body as Record<string, unknown>;
		if (
			typeof timeHorizonYears !== "number" ||
			!Number.isInteger(timeHorizonYears) ||
			timeHorizonYears < MIN_TIME_HORIZON_YEARS ||
			timeHorizonYears > MAX_TIME_HORIZON_YEARS
		) {
			return validationError(
				`timeHorizonYears must be an integer between ${MIN_TIME_HORIZON_YEARS} and ${MAX_TIME_HORIZON_YEARS}`,
			);
		}

		const snapshot = await buildPortfolioSnapshot();
		if (snapshot.accounts.length === 0) {
			return validationError("Add accounts first to generate insights");
		}

		const gateway = new AuditingLLMGateway(
			new OpenAIGateway(),
			new LLMAuditService(),
		);
		const result = await generateProjections(
			snapshot,
			timeHorizonYears,
			gateway,
		);
		return NextResponse.json(result);
	} catch (e) {
		if (e instanceof ProjectionsValidationError) {
			return validationError(e.message);
		}
		if (e instanceof LLMUnavailableError) {
			return NextResponse.json(
				{
					code: "SERVICE_UNAVAILABLE",
					message: "Insights temporarily unavailable",
				},
				{ status: 503 },
			);
		}
		console.error("POST /api/v1/insights/projections", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
