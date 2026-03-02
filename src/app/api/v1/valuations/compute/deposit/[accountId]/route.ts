/**
 * POST /api/v1/valuations/compute/deposit/[accountId] - Compute deposit valuation and persist
 */

import { computeDepositValuation } from "@/application/valuation/compute-deposit-valuation";
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
		if (account.type !== "bank_deposit") {
			return NextResponse.json(
				{
					code: "ACCOUNT_TYPE_MISMATCH",
					message: "Account is not of type bank_deposit",
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
			// no body: use default asOfDate
		}
		const result = await computeDepositValuation(accountId, asOfDate);
		if (!result) {
			return NextResponse.json(
				{
					code: "RATE_CONFIG_REQUIRED",
					message: "Set rate and frequency for this deposit account",
				},
				{ status: 400 },
			);
		}
		return NextResponse.json(
			{
				valuePaise: result.valuePaise,
				asOfDate: result.asOfDate.toISOString().slice(0, 10),
				method: "deposit",
			},
			{ status: 201 },
		);
	} catch (e) {
		console.error("POST /api/v1/valuations/compute/deposit/[accountId]", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
