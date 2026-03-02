/**
 * GET /api/v1/auth/status - Configured and authenticated state (bolt 007).
 */

import * as userConfigRepo from "@/infrastructure/prisma/user-config-repository";
import { SESSION_OPTIONS, type SessionData } from "@/lib/session";
import { getIronSession } from "iron-session";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const config = await userConfigRepo.getUserConfig();
		const configured = !!config;
		const res = NextResponse.next();
		const session = await getIronSession<SessionData>(
			request,
			res,
			SESSION_OPTIONS,
		);
		const authenticated = !!session.keyBase64;
		return NextResponse.json({
			configured,
			authenticated: configured ? authenticated : undefined,
		});
	} catch (e) {
		console.error("GET /api/v1/auth/status", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
