/**
 * POST /api/v1/valuations - Log valuation (point-in-time value)
 */

import { logValuation } from "@/application/portfolio/log-valuation";
import { NextResponse } from "next/server";

function validationError(message: string) {
	return NextResponse.json(
		{ code: "VALIDATION_ERROR", message },
		{ status: 400 },
	);
}

function notFound() {
	return NextResponse.json(
		{ code: "NOT_FOUND", message: "Account not found" },
		{ status: 404 },
	);
}

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as unknown;
		if (!body || typeof body !== "object") {
			return validationError("Request body must be a JSON object");
		}
		const { accountId, date, valuePaise } = body as Record<string, unknown>;
		if (typeof accountId !== "string" || !accountId.trim()) {
			return validationError("accountId is required");
		}
		if (
			typeof valuePaise !== "number" ||
			!Number.isInteger(valuePaise) ||
			valuePaise < 0
		) {
			return validationError("valuePaise must be a non-negative integer");
		}
		const dateObj =
			date !== undefined && date !== null
				? typeof date === "string"
					? new Date(date)
					: new Date(Number(date))
				: new Date();
		if (Number.isNaN(dateObj.getTime())) {
			return validationError("date must be a valid ISO date string");
		}
		const valuation = await logValuation({
			accountId: accountId.trim(),
			date: dateObj,
			valuePaise,
		});
		if (!valuation) return notFound();
		return NextResponse.json(
			{
				id: valuation.id,
				accountId: valuation.accountId,
				date: valuation.date.toISOString().slice(0, 10),
				valuePaise: valuation.valuePaise,
				createdAt: valuation.createdAt.toISOString(),
			},
			{ status: 201 },
		);
	} catch (e) {
		console.error("POST /api/v1/valuations", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
