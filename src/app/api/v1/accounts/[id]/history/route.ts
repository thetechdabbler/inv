/**
 * GET /api/v1/accounts/:id/history - Chronological history (transactions + valuations)
 */

import { getAccountHistory } from "@/application/portfolio/get-account-history";
import { NextResponse } from "next/server";

function notFound() {
	return NextResponse.json(
		{ code: "NOT_FOUND", message: "Account not found" },
		{ status: 404 },
	);
}

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const url = new URL(request.url);
		const fromParam = url.searchParams.get("from");
		const toParam = url.searchParams.get("to");
		const limitParam = url.searchParams.get("limit");
		const from = fromParam ? new Date(fromParam) : undefined;
		const to = toParam ? new Date(toParam) : undefined;
		if (from !== undefined && Number.isNaN(from.getTime())) {
			return NextResponse.json(
				{ code: "VALIDATION_ERROR", message: "from must be a valid ISO date" },
				{ status: 400 },
			);
		}
		if (to !== undefined && Number.isNaN(to.getTime())) {
			return NextResponse.json(
				{ code: "VALIDATION_ERROR", message: "to must be a valid ISO date" },
				{ status: 400 },
			);
		}
		const limit =
			limitParam !== null
				? Math.min(Math.max(1, Number.parseInt(limitParam, 10) || 50), 500)
				: 50;
		const entries = await getAccountHistory({
			accountId: id,
			from,
			to,
			limit,
		});
		if (entries === null) return notFound();
		return NextResponse.json({ entries });
	} catch (e) {
		console.error("GET /api/v1/accounts/[id]/history", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
