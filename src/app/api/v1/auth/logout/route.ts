/**
 * POST /api/v1/auth/logout - Clear session (bolt 009 UI).
 */

import { SESSION_OPTIONS, type SessionData } from "@/lib/session";
import { getIronSession } from "iron-session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const res = NextResponse.json({ ok: true });
		const session = await getIronSession<SessionData>(
			request,
			res,
			SESSION_OPTIONS,
		);
		session.keyBase64 = undefined;
		await session.save();
		return res;
	} catch (e) {
		console.error("POST /api/v1/auth/logout", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
