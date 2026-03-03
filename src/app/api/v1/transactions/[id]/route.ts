/**
 * PATCH/DELETE /api/v1/transactions/:id
 */

import { deleteTransaction } from "@/application/portfolio/delete-transaction";
import { updateTransaction } from "@/application/portfolio/update-transaction";
import {
	TRANSACTION_TYPES,
	type TransactionType,
} from "@/domain/portfolio/types";
import { NextResponse } from "next/server";

function validationError(message: string) {
	return NextResponse.json(
		{ code: "VALIDATION_ERROR", message },
		{ status: 400 },
	);
}

function notFound() {
	return NextResponse.json(
		{ code: "NOT_FOUND", message: "Transaction not found" },
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
		const { date, amountPaise, type, description } = body as Record<
			string,
			unknown
		>;

		const updates: {
			date?: Date;
			amountPaise?: number;
			type?: TransactionType;
			description?: string | null;
		} = {};

		if (date !== undefined) {
			const dateObj =
				typeof date === "string" ? new Date(date) : new Date(Number(date));
			if (Number.isNaN(dateObj.getTime())) {
				return validationError("date must be a valid ISO date string");
			}
			updates.date = dateObj;
		}

		if (amountPaise !== undefined) {
			if (
				typeof amountPaise !== "number" ||
				!Number.isInteger(amountPaise) ||
				amountPaise <= 0
			) {
				return validationError("amountPaise must be a positive integer");
			}
			updates.amountPaise = amountPaise;
		}

		if (type !== undefined) {
			if (
				typeof type !== "string" ||
				!TRANSACTION_TYPES.includes(type as TransactionType)
			) {
				return validationError(
					`type must be one of: ${TRANSACTION_TYPES.join(", ")}`,
				);
			}
			updates.type = type as TransactionType;
		}

		if (description !== undefined) {
			updates.description = description !== null ? String(description) : null;
		}

		const transaction = await updateTransaction({ id, ...updates });
		if (!transaction) return notFound();
		return NextResponse.json({
			id: transaction.id,
			accountId: transaction.accountId,
			date: transaction.date.toISOString().slice(0, 10),
			amountPaise: transaction.amountPaise,
			type: transaction.type,
			description: transaction.description,
			createdAt: transaction.createdAt.toISOString(),
		});
	} catch (e) {
		console.error("PATCH /api/v1/transactions/[id]", e);
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
		const deleted = await deleteTransaction(id);
		if (!deleted) return notFound();
		return NextResponse.json({ success: true });
	} catch (e) {
		console.error("DELETE /api/v1/transactions/[id]", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
