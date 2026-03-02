/**
 * POST /api/v1/auth/login - Verify passphrase and create session (bolt 007).
 * Logs access attempt (bolt 008).
 */

import { verifyPassphrase } from "@/application/auth/verify-passphrase";
import {
	createAccessLog,
	maybePurgeOldAccessLogs,
} from "@/infrastructure/prisma/access-log-repository";
import { SESSION_OPTIONS, type SessionData } from "@/lib/session";
import { getIronSession } from "iron-session";
import { NextResponse } from "next/server";

function getClientIp(request: Request): string {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
	return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
	const ip = getClientIp(request);
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
		if (!passphrase.trim()) {
			return NextResponse.json(
				{ code: "VALIDATION_ERROR", message: "passphrase is required" },
				{ status: 400 },
			);
		}
		const result = await verifyPassphrase(passphrase);
		if ("error" in result) {
			await createAccessLog("login", ip, false);
			await maybePurgeOldAccessLogs();
			if (result.error === "not_configured") {
				return NextResponse.json(
					{ code: "NOT_CONFIGURED", message: "Set up passphrase first" },
					{ status: 404 },
				);
			}
			return NextResponse.json(
				{ code: "INVALID_PASSPHRASE", message: "Invalid passphrase" },
				{ status: 401 },
			);
		}
		await createAccessLog("login", ip, true);
		await maybePurgeOldAccessLogs();
		const res = NextResponse.json({ ok: true });
		const session = await getIronSession<SessionData>(
			request,
			res,
			SESSION_OPTIONS,
		);
		session.keyBase64 = result.keyBase64;
		await session.save();
		return res;
	} catch (e) {
		console.error("POST /api/v1/auth/login", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
