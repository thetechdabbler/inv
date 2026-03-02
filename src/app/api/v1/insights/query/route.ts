/**
 * POST /api/v1/insights/query
 * Answer a natural language question about the portfolio.
 * Body: { question: string } — required, non-empty, max 1000 chars.
 */

import { LLMAuditService } from "@/application/insights/llm-audit-service";
import {
	MAX_QUESTION_LENGTH,
	NLQueryValidationError,
	processNLQuery,
} from "@/application/insights/process-nl-query";
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
		const { question } = body as Record<string, unknown>;
		if (typeof question !== "string" || !question.trim()) {
			return validationError("question must be a non-empty string");
		}
		if (question.trim().length > MAX_QUESTION_LENGTH) {
			return validationError(
				`question must be at most ${MAX_QUESTION_LENGTH} characters`,
			);
		}

		const snapshot = await buildPortfolioSnapshot();
		if (snapshot.accounts.length === 0) {
			return validationError("Add accounts first to generate insights");
		}

		const auditService = new LLMAuditService();
		const gateway = new AuditingLLMGateway(new OpenAIGateway(), auditService);
		const result = await processNLQuery(question, snapshot, gateway);
		return NextResponse.json(result);
	} catch (e) {
		if (e instanceof NLQueryValidationError) {
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
		console.error("POST /api/v1/insights/query", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
