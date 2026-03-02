/**
 * POST /api/v1/insights/rebalancing
 * Generate rebalancing recommendations (current vs optional target allocation).
 * Body: { targetAllocation?: Record<string, number> } — values must sum to 1.0.
 */

import { LLMAuditService } from "@/application/insights/llm-audit-service";
import {
	RebalancingValidationError,
	recommendRebalancing,
} from "@/application/insights/recommend-rebalancing";
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
		const { targetAllocation } = body as Record<string, unknown>;

		// targetAllocation is optional; if present must be an object
		let parsedTarget: Record<string, number> | null = null;
		if (targetAllocation !== undefined && targetAllocation !== null) {
			if (
				typeof targetAllocation !== "object" ||
				Array.isArray(targetAllocation)
			) {
				return validationError(
					"targetAllocation must be an object mapping account types to fractions",
				);
			}
			parsedTarget = targetAllocation as Record<string, number>;
		}

		const snapshot = await buildPortfolioSnapshot();
		if (snapshot.accounts.length === 0) {
			return validationError("Add accounts first to generate insights");
		}

		const auditService = new LLMAuditService();
		const gateway = new AuditingLLMGateway(new OpenAIGateway(), auditService);
		const result = await recommendRebalancing(snapshot, parsedTarget, gateway);
		return NextResponse.json(result);
	} catch (e) {
		if (e instanceof RebalancingValidationError) {
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
		console.error("POST /api/v1/insights/rebalancing", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
