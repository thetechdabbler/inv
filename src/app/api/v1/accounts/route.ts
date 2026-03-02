/**
 * POST /api/v1/accounts - Create account
 * GET  /api/v1/accounts - List accounts
 */

import { createAccount } from "@/application/portfolio/create-account";
import { listAccounts } from "@/application/portfolio/list-accounts";
import {
	ACCOUNT_TYPES,
	type CreateAccountInput,
	NAME_MAX_LENGTH,
} from "@/domain/portfolio/types";
import { NextResponse } from "next/server";

function validationError(message: string) {
	return NextResponse.json(
		{ code: "VALIDATION_ERROR", message },
		{ status: 400 },
	);
}

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as unknown;
		if (!body || typeof body !== "object") {
			return validationError("Request body must be a JSON object");
		}
		const { type, name, description, initialBalancePaise } = body as Record<
			string,
			unknown
		>;
		if (
			typeof type !== "string" ||
			!ACCOUNT_TYPES.includes(type as CreateAccountInput["type"])
		) {
			return validationError(
				`type must be one of: ${ACCOUNT_TYPES.join(", ")}`,
			);
		}
		if (typeof name !== "string") {
			return validationError("name must be a string");
		}
		const trimmedName = name.trim();
		if (!trimmedName) {
			return validationError("name is required and cannot be empty");
		}
		if (trimmedName.length > NAME_MAX_LENGTH) {
			return validationError(
				`name must be at most ${NAME_MAX_LENGTH} characters`,
			);
		}
		if (
			typeof initialBalancePaise !== "number" ||
			!Number.isInteger(initialBalancePaise) ||
			initialBalancePaise < 0
		) {
			return validationError(
				"initialBalancePaise must be a non-negative integer",
			);
		}
		const desc =
			description !== undefined && description !== null
				? String(description)
				: undefined;
		const account = await createAccount({
			type: type as CreateAccountInput["type"],
			name: trimmedName,
			description: desc ?? null,
			initialBalancePaise,
		});
		return NextResponse.json(account, { status: 201 });
	} catch (e) {
		console.error("POST /api/v1/accounts", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		const accounts = await listAccounts();
		const list = accounts.map((a) => ({
			...a,
			createdAt: a.createdAt.toISOString(),
			updatedAt: a.updatedAt.toISOString(),
		}));
		return NextResponse.json({ accounts: list });
	} catch (e) {
		console.error("GET /api/v1/accounts", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
