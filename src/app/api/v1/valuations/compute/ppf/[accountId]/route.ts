/**
 * POST /api/v1/valuations/compute/ppf/[accountId] - Compute PPF valuation and persist
 */

import { computePPFValuation } from "@/application/valuation/compute-ppf-valuation";
import * as accountRepo from "@/infrastructure/prisma/account-repository";
import { NextResponse } from "next/server";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ accountId: string }> },
) {
	try {
		const { accountId } = await params;
		const account = await accountRepo.findAccountById(accountId);
		if (!account) {
			return NextResponse.json(
				{ code: "NOT_FOUND", message: "Account not found" },
				{ status: 404 },
			);
		}
		if (account.type !== "ppf") {
			return NextResponse.json(
				{
					code: "ACCOUNT_TYPE_MISMATCH",
					message: "Account is not of type ppf",
				},
				{ status: 409 },
			);
		}
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
			// no body or invalid JSON: use default asOfDate
		}
		const result = await computePPFValuation(accountId, asOfDate);
		if (!result) {
			return NextResponse.json(
				{ code: "NOT_FOUND", message: "Account not found" },
				{ status: 404 },
			);
		}
		return NextResponse.json(
			{
				valuePaise: result.valuePaise,
				asOfDate: result.asOfDate.toISOString().slice(0, 10),
				method: "ppf",
			},
			{ status: 201 },
		);
	} catch (e) {
		console.error("POST /api/v1/valuations/compute/ppf/[accountId]", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
