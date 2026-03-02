/**
 * GET  /api/v1/valuations/rates/ppf - List PPF rates by financial year
 * PUT  /api/v1/valuations/rates/ppf - Set PPF rate for a financial year
 */

import { getPPFRates } from "@/application/valuation/get-ppf-rates";
import { setPPFRate } from "@/application/valuation/set-ppf-rate";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const rates = await getPPFRates();
		return NextResponse.json({ rates });
	} catch (e) {
		console.error("GET /api/v1/valuations/rates/ppf", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PUT(request: Request) {
	try {
		const body = (await request.json()) as unknown;
		if (!body || typeof body !== "object") {
			return NextResponse.json(
				{
					code: "VALIDATION_ERROR",
					message: "Request body must be a JSON object",
				},
				{ status: 400 },
			);
		}
		const { financialYear, ratePercentPerAnnum } = body as Record<
			string,
			unknown
		>;
		if (
			typeof financialYear !== "number" ||
			!Number.isInteger(financialYear) ||
			financialYear < 2000 ||
			financialYear > 2100
		) {
			return NextResponse.json(
				{
					code: "VALIDATION_ERROR",
					message: "financialYear must be an integer between 2000 and 2100",
				},
				{ status: 400 },
			);
		}
		if (typeof ratePercentPerAnnum !== "number" || ratePercentPerAnnum < 0) {
			return NextResponse.json(
				{
					code: "VALIDATION_ERROR",
					message: "ratePercentPerAnnum must be a non-negative number",
				},
				{ status: 400 },
			);
		}
		const result = await setPPFRate(financialYear, ratePercentPerAnnum);
		return NextResponse.json(result);
	} catch (e) {
		console.error("PUT /api/v1/valuations/rates/ppf", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
