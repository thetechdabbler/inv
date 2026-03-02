/**
 * POST /api/v1/auth/setup - First-time passphrase setup (bolt 007).
 */

import { setupPassphrase } from "@/application/auth/setup-passphrase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
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
		const passphrase =
			typeof (body as Record<string, unknown>).passphrase === "string"
				? (body as { passphrase: string }).passphrase
				: "";
		const result = await setupPassphrase(passphrase);
		if ("ok" in result && result.ok) {
			return NextResponse.json({ ok: true });
		}
		if ("error" in result && result.error === "validation") {
			return NextResponse.json(
				{ code: "VALIDATION_ERROR", message: result.message },
				{ status: 400 },
			);
		}
		return NextResponse.json(
			{ code: "ALREADY_CONFIGURED", message: "Passphrase already set" },
			{ status: 409 },
		);
	} catch (e) {
		console.error("POST /api/v1/auth/setup", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
