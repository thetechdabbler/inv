/**
 * POST /api/v1/insights/projections
 * Generate hybrid portfolio projections: deterministic series + LLM narrative.
 * Body: {} (no parameters required — snapshot provides the projection horizon).
 * Returns HybridProjectionResult (bolt 023).
 */

import { generateHybridProjection } from "@/application/insights/generate-hybrid-projection";
import { LLMAuditService } from "@/application/insights/llm-audit-service";
import { buildPortfolioSnapshot } from "@/application/insights/snapshot-builder";
import { LLMUnavailableError } from "@/domain/insights/llm-gateway";
import { AuditingLLMGateway } from "@/infrastructure/openai/auditing-llm-gateway";
import { OpenAIGateway } from "@/infrastructure/openai/openai-gateway";
import { NextResponse } from "next/server";

export async function POST() {
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
		const snapshot = await buildPortfolioSnapshot();
		if (snapshot.accounts.length === 0) {
			return NextResponse.json(
				{ code: "VALIDATION_ERROR", message: "Add accounts first to generate insights" },
				{ status: 400 },
			);
		}

		const gateway = new AuditingLLMGateway(
			new OpenAIGateway(),
			new LLMAuditService(),
		);
		const result = await generateHybridProjection(snapshot, gateway);
		return NextResponse.json(result);
	} catch (e) {
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
