import { findAccountById } from "@/infrastructure/prisma/account-repository";
import {
	findByAccountId,
	upsertForAccount,
} from "@/infrastructure/prisma/employment-info-repository";
import { NextResponse } from "next/server";

function validationError(message: string) {
	return NextResponse.json(
		{ code: "VALIDATION_ERROR", message },
		{ status: 400 },
	);
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ accountId: string }> },
) {
	const { accountId } = await params;
	const trimmedId = accountId.trim();
	if (!trimmedId) {
		return validationError("accountId is required");
	}

	const account = await findAccountById(trimmedId);
	if (!account) {
		return NextResponse.json(
			{ code: "NOT_FOUND", message: "Account not found" },
			{ status: 404 },
		);
	}

	const info = await findByAccountId(trimmedId);
	if (!info) {
		return NextResponse.json(
			{
				accountId: trimmedId,
				employerName: null,
				basicSalaryInr: null,
				vpfAmountInr: null,
				joiningDate: null,
			},
			{ status: 200 },
		);
	}

	return NextResponse.json(
		{
			accountId: info.accountId,
			employerName: info.employerName,
			basicSalaryInr: info.basicSalaryInr,
			vpfAmountInr: info.vpfAmountInr,
			joiningDate: info.joiningDate
				? info.joiningDate.toISOString().slice(0, 10)
				: null,
		},
		{ status: 200 },
	);
}

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ accountId: string }> },
) {
	const { accountId } = await params;
	const trimmedId = accountId.trim();
	if (!trimmedId) {
		return validationError("accountId is required");
	}

	const account = await findAccountById(trimmedId);
	if (!account) {
		return NextResponse.json(
			{ code: "NOT_FOUND", message: "Account not found" },
			{ status: 404 },
		);
	}

	const body = (await request.json()) as unknown;
	if (!body || typeof body !== "object") {
		return validationError("Request body must be a JSON object");
	}

	const { employerName, basicSalaryInr, vpfAmountInr, joiningDate } = body as
		Record<string, unknown>;

	let basic: number | null | undefined;
	if (basicSalaryInr !== undefined) {
		if (basicSalaryInr === null) {
			basic = null;
		} else {
			const n = Number(basicSalaryInr);
			if (!Number.isFinite(n)) {
				return validationError("basicSalaryInr must be a finite number or null");
			}
			basic = n;
		}
	}

	let vpf: number | null | undefined;
	if (vpfAmountInr !== undefined) {
		if (vpfAmountInr === null) {
			vpf = null;
		} else {
			const n = Number(vpfAmountInr);
			if (!Number.isFinite(n)) {
				return validationError("vpfAmountInr must be a finite number or null");
			}
			vpf = n;
		}
	}

	let joinDate: Date | null | undefined;
	if (joiningDate !== undefined) {
		if (joiningDate === null) {
			joinDate = null;
		} else if (typeof joiningDate === "string") {
			const d = new Date(joiningDate);
			if (Number.isNaN(d.getTime())) {
				return validationError("joiningDate must be a valid ISO date string");
			}
			joinDate = d;
		} else {
			return validationError("joiningDate must be a string or null");
		}
	}

	const updated = await upsertForAccount({
		accountId: trimmedId,
		employerName:
			employerName === undefined
				? undefined
				: employerName === null
					? null
					: String(employerName),
		basicSalaryInr: basic,
		vpfAmountInr: vpf,
		joiningDate: joinDate,
	});

	return NextResponse.json(
		{
			accountId: updated.accountId,
			employerName: updated.employerName,
			basicSalaryInr: updated.basicSalaryInr,
			vpfAmountInr: updated.vpfAmountInr,
			joiningDate: updated.joiningDate
				? updated.joiningDate.toISOString().slice(0, 10)
				: null,
		},
		{ status: 200 },
	);
}

