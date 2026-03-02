/**
 * GET    /api/v1/accounts/:id - Get one account (with current value)
 * PATCH  /api/v1/accounts/:id - Update account
 * DELETE /api/v1/accounts/:id?confirm=true - Delete account
 */

import { deleteAccount } from "@/application/portfolio/delete-account";
import { updateAccount } from "@/application/portfolio/update-account";
import {
	ACCOUNT_TYPES,
	type AccountType,
	NAME_MAX_LENGTH,
	type UpdateAccountInput,
} from "@/domain/portfolio/types";
import { findAccountById } from "@/infrastructure/prisma/account-repository";
import { sumInvestmentAmountByAccountId } from "@/infrastructure/prisma/transaction-repository";
import { findLatestValueByAccountId } from "@/infrastructure/prisma/valuation-repository";
import { NextResponse } from "next/server";

function notFound() {
	return NextResponse.json(
		{ code: "NOT_FOUND", message: "Account not found" },
		{ status: 404 },
	);
}

function validationError(message: string) {
	return NextResponse.json(
		{ code: "VALIDATION_ERROR", message },
		{ status: 400 },
	);
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const account = await findAccountById(id);
		if (!account) return notFound();
		const [currentValuePaise, totalContributionsPaise] = await Promise.all([
			findLatestValueByAccountId(id),
			sumInvestmentAmountByAccountId(id),
		]);
		return NextResponse.json({
			...account,
			currentValuePaise: currentValuePaise ?? account.initialBalancePaise,
			totalContributionsPaise: totalContributionsPaise ?? 0,
			createdAt: account.createdAt.toISOString(),
			updatedAt: account.updatedAt.toISOString(),
		});
	} catch (e) {
		console.error("GET /api/v1/accounts/[id]", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const account = await findAccountById(id);
		if (!account) return notFound();
		const body = (await request.json()) as unknown;
		if (!body || typeof body !== "object") {
			return validationError("Request body must be a JSON object");
		}
		const { name, description, type } = body as Record<string, unknown>;
		const input: UpdateAccountInput = {};
		if (name !== undefined) {
			if (typeof name !== "string") {
				return validationError("name must be a string");
			}
			const trimmed = name.trim();
			if (!trimmed) return validationError("name cannot be empty");
			if (trimmed.length > NAME_MAX_LENGTH) {
				return validationError(
					`name must be at most ${NAME_MAX_LENGTH} characters`,
				);
			}
			input.name = trimmed;
		}
		if (description !== undefined) {
			input.description =
				description === null || description === undefined
					? null
					: String(description).trim();
		}
		if (type !== undefined) {
			if (
				typeof type !== "string" ||
				!ACCOUNT_TYPES.includes(type as AccountType)
			) {
				return validationError(
					`type must be one of: ${ACCOUNT_TYPES.join(", ")}`,
				);
			}
			input.type = type as AccountType;
		}
		if (Object.keys(input).length === 0) {
			return NextResponse.json(account, { status: 200 });
		}
		const updated = await updateAccount(id, input);
		if (!updated) return notFound();
		return NextResponse.json({
			...updated,
			createdAt: updated.createdAt.toISOString(),
			updatedAt: updated.updatedAt.toISOString(),
		});
	} catch (e) {
		console.error("PATCH /api/v1/accounts/[id]", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const url = new URL(request.url);
		if (url.searchParams.get("confirm") !== "true") {
			return NextResponse.json(
				{
					code: "CONFIRM_REQUIRED",
					message:
						"Query parameter confirm=true is required to delete an account",
				},
				{ status: 400 },
			);
		}
		const existed = await findAccountById(id);
		if (!existed) return notFound();
		const deleted = await deleteAccount(id);
		if (!deleted) return notFound();
		return new NextResponse(null, { status: 204 });
	} catch (e) {
		console.error("DELETE /api/v1/accounts/[id]", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
