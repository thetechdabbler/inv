/**
 * GET  /api/v1/accounts/[id]/market-config - Get scheme code / ticker, units / shares
 * PUT  /api/v1/accounts/[id]/market-config - Set market config for MF or stock account
 */

import { getMarketConfig } from "@/application/valuation/get-market-config";
import { setMarketConfig } from "@/application/valuation/set-market-config";
import * as accountRepo from "@/infrastructure/prisma/account-repository";
import { NextResponse } from "next/server";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: accountId } = await params;
		const account = await accountRepo.findAccountById(accountId);
		if (!account) {
			return NextResponse.json(
				{ code: "NOT_FOUND", message: "Account not found" },
				{ status: 404 },
			);
		}
		const config = await getMarketConfig(accountId);
		if (!config) {
			return NextResponse.json(
				{ code: "NOT_FOUND", message: "No market config for this account" },
				{ status: 404 },
			);
		}
		return NextResponse.json(config);
	} catch (e) {
		console.error("GET /api/v1/accounts/[id]/market-config", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: accountId } = await params;
		const account = await accountRepo.findAccountById(accountId);
		if (!account) {
			return NextResponse.json(
				{ code: "NOT_FOUND", message: "Account not found" },
				{ status: 404 },
			);
		}
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
		const { schemeCode, ticker, units, shares } = body as Record<
			string,
			unknown
		>;
		const input: {
			schemeCode?: string | null;
			ticker?: string | null;
			units?: number | null;
			shares?: number | null;
		} = {};
		if (schemeCode !== undefined)
			input.schemeCode =
				schemeCode == null ? null : String(schemeCode).trim() || null;
		if (ticker !== undefined)
			input.ticker = ticker == null ? null : String(ticker).trim() || null;
		if (units !== undefined) {
			if (units != null && (typeof units !== "number" || units < 0)) {
				return NextResponse.json(
					{
						code: "VALIDATION_ERROR",
						message: "units must be a non-negative number",
					},
					{ status: 400 },
				);
			}
			input.units = units == null ? null : Number(units);
		}
		if (shares !== undefined) {
			if (shares != null && (typeof shares !== "number" || shares < 0)) {
				return NextResponse.json(
					{
						code: "VALIDATION_ERROR",
						message: "shares must be a non-negative number",
					},
					{ status: 400 },
				);
			}
			input.shares = shares == null ? null : Number(shares);
		}
		const result = await setMarketConfig(accountId, input);
		if (!result) {
			return NextResponse.json(
				{ code: "NOT_FOUND", message: "Account not found" },
				{ status: 404 },
			);
		}
		return NextResponse.json(result);
	} catch (e) {
		console.error("PUT /api/v1/accounts/[id]/market-config", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
