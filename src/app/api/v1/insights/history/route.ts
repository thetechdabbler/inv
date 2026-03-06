/**
 * GET /api/v1/insights/history
 * Retrieve paginated LLM interaction audit trail.
 * Query params: limit (default 20, max 100), offset (default 0).
 */

import { findAllLLMQueries } from "@/infrastructure/prisma/llm-query-repository";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const limitParam = url.searchParams.get("limit");
		const offsetParam = url.searchParams.get("offset");
		const typeParam = url.searchParams.get("type");
		const fromParam = url.searchParams.get("from");
		const toParam = url.searchParams.get("to");

		const limit = limitParam
			? Math.min(Math.max(Number.parseInt(limitParam, 10) || 20, 1), 100)
			: 20;
		const offset = offsetParam
			? Math.max(Number.parseInt(offsetParam, 10) || 0, 0)
			: 0;

		const from = fromParam ? new Date(fromParam) : undefined;
		const to = toParam ? new Date(`${toParam}T23:59:59.999Z`) : undefined;

		const { records, total } = await findAllLLMQueries({
			limit,
			offset,
			type: typeParam ?? undefined,
			from: from && !Number.isNaN(from.getTime()) ? from : undefined,
			to: to && !Number.isNaN(to.getTime()) ? to : undefined,
		});

		const interactions = records.map((r) => ({
			id: r.id,
			insightType: r.insightType,
			prompt: r.prompt,
			response: r.response?.responseText ?? "",
			modelUsed: r.response?.modelUsed ?? r.modelRequested,
			tokensUsed: r.response?.tokensUsed ?? null,
			success: r.response?.success ?? false,
			errorMessage: r.response?.errorMessage ?? null,
			createdAt: r.createdAt.toISOString(),
		}));

		return NextResponse.json({ interactions, total });
	} catch (e) {
		console.error("GET /api/v1/insights/history", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
