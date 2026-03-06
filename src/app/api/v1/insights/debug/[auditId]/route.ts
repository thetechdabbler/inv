/**
 * GET /api/v1/insights/debug/:auditId
 * Returns the raw audit pair (prompt + response) for a single LLM call.
 * Protected by iron-session middleware (ADR-002).
 * Used for debugging — raw LLM output before post-processing.
 */

import { findDebugView } from "@/infrastructure/prisma/llm-response-repository";
import { NextResponse } from "next/server";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ auditId: string }> },
) {
	try {
		const { auditId } = await params;
		if (!auditId || typeof auditId !== "string") {
			return NextResponse.json(
				{ code: "VALIDATION_ERROR", message: "auditId is required" },
				{ status: 400 },
			);
		}

		const view = await findDebugView(auditId);
		if (!view) {
			return NextResponse.json(
				{ code: "NOT_FOUND", message: "Audit record not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(view);
	} catch (e) {
		console.error("GET /api/v1/insights/debug/[auditId]", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
