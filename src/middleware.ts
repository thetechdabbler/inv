/**
 * Bolt 007: Protect /api/v1/* except /api/v1/auth/*. Require valid session cookie.
 */

import { SESSION_OPTIONS, type SessionData } from "@/lib/session";
import { getIronSession } from "iron-session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PREFIX = "/api/v1/auth";

export async function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname;
	if (!path.startsWith("/api/v1")) {
		return NextResponse.next();
	}
	if (path.startsWith(AUTH_PREFIX)) {
		return NextResponse.next();
	}
	if (process.env.NODE_ENV === "test") {
		return NextResponse.next();
	}
	const res = NextResponse.next();
	const session = await getIronSession<SessionData>(
		request,
		res,
		SESSION_OPTIONS,
	);
	if (!session.keyBase64) {
		return NextResponse.json(
			{ code: "UNAUTHORIZED", message: "Authentication required" },
			{ status: 401 },
		);
	}
	return res;
}

export const config = {
	matcher: ["/api/v1/:path*"],
};
