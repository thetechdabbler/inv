/**
 * PATCH/DELETE /api/v1/valuations/:id
 */

import { deleteValuation } from "@/application/portfolio/delete-valuation";
import { updateValuation } from "@/application/portfolio/update-valuation";
import { NextResponse } from "next/server";

function validationError(message: string) {
	return NextResponse.json(
		{ code: "VALIDATION_ERROR", message },
		{ status: 400 },
	);
}

function notFound() {
	return NextResponse.json(
		{ code: "NOT_FOUND", message: "Valuation not found" },
		{ status: 404 },
	);
}

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = (await request.json()) as unknown;
		if (!body || typeof body !== "object") {
			return validationError("Request body must be a JSON object");
		}
		const { date, valuePaise } = body as Record<string, unknown>;

		const updates: { date?: Date; valuePaise?: number } = {};

		if (date !== undefined) {
			const dateObj =
				typeof date === "string" ? new Date(date) : new Date(Number(date));
			if (Number.isNaN(dateObj.getTime())) {
				return validationError("date must be a valid ISO date string");
			}
			updates.date = dateObj;
		}

		if (valuePaise !== undefined) {
			if (
				typeof valuePaise !== "number" ||
				!Number.isInteger(valuePaise) ||
				valuePaise < 0
			) {
				return validationError("valuePaise must be a non-negative integer");
			}
			updates.valuePaise = valuePaise;
		}

		const valuation = await updateValuation({ id, ...updates });
		if (!valuation) return notFound();
		return NextResponse.json({
			id: valuation.id,
			accountId: valuation.accountId,
			date: valuation.date.toISOString().slice(0, 10),
			valuePaise: valuation.valuePaise,
			createdAt: valuation.createdAt.toISOString(),
		});
	} catch (e) {
		console.error("PATCH /api/v1/valuations/[id]", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const deleted = await deleteValuation(id);
		if (!deleted) return notFound();
		return NextResponse.json({ success: true });
	} catch (e) {
		console.error("DELETE /api/v1/valuations/[id]", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
