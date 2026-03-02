/**
 * GET /api/v1/portfolio/performance - Aggregated performance across all accounts
 */

import { getPortfolioPerformance } from "@/application/portfolio/get-portfolio-performance";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const snapshot = await getPortfolioPerformance();
		return NextResponse.json(snapshot);
	} catch (e) {
		console.error("GET /api/v1/portfolio/performance", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
