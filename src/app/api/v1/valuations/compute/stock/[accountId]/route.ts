/**
 * POST /api/v1/valuations/compute/stock/[accountId] - Compute stock valuation from price
 */

import { computeStockValuation } from "@/application/valuation/compute-stock-valuation";
import { NextResponse } from "next/server";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ accountId: string }> },
) {
	try {
		const { accountId } = await params;
		let asOfDate = new Date();
		try {
			const body = (await request.json()) as { asOfDate?: string } | null;
			if (body?.asOfDate) {
				asOfDate = new Date(body.asOfDate);
				if (Number.isNaN(asOfDate.getTime())) {
					return NextResponse.json(
						{
							code: "VALIDATION_ERROR",
							message: "asOfDate must be a valid ISO date",
						},
						{ status: 400 },
					);
				}
			}
		} catch {
			// no body: use default
		}
		const result = await computeStockValuation(accountId, asOfDate);
		if ("error" in result) {
			if (result.error === "account_not_found") {
				return NextResponse.json(
					{ code: "NOT_FOUND", message: "Account not found" },
					{ status: 404 },
				);
			}
			if (result.error === "account_type_mismatch") {
				return NextResponse.json(
					{
						code: "ACCOUNT_TYPE_MISMATCH",
						message: "Account is not of type stocks",
					},
					{ status: 409 },
				);
			}
			if (result.error === "market_config_required") {
				return NextResponse.json(
					{
						code: "MARKET_CONFIG_REQUIRED",
						message: "Set ticker and shares for this stock account",
					},
					{ status: 400 },
				);
			}
			return NextResponse.json(
				{
					code: "FETCH_FAILED",
					message: "Could not fetch data; no previous valuation",
				},
				{ status: 503 },
			);
		}
		if (result.ok) {
			return NextResponse.json(
				{
					valuePaise: result.valuePaise,
					asOfDate: result.asOfDate.toISOString().slice(0, 10),
					method: "stock",
					source: result.source,
				},
				{ status: 201 },
			);
		}
		return NextResponse.json(
			{
				valuePaise: result.fallbackValuePaise,
				asOfDate: result.asOfDate.toISOString().slice(0, 10),
				method: "stock",
				source: "fallback",
				warning: result.warning,
			},
			{ status: 200 },
		);
	} catch (e) {
		console.error("POST /api/v1/valuations/compute/stock/[accountId]", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
