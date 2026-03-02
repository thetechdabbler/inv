/**
 * GET /api/v1/audit/access-logs (bolt 008).
 */

import { findRecentAccessLogs } from "@/infrastructure/prisma/access-log-repository";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const limit = Math.min(
			Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "100", 10)),
			500,
		);
		const sinceParam = url.searchParams.get("since");
		const since = sinceParam ? new Date(sinceParam) : undefined;
		if (sinceParam && Number.isNaN(since!.getTime())) {
			return NextResponse.json(
				{ code: "VALIDATION_ERROR", message: "since must be a valid ISO date" },
				{ status: 400 },
			);
		}
		const logs = await findRecentAccessLogs(limit, since);
		return NextResponse.json({
			logs: logs.map((l) => ({
				id: l.id,
				action: l.action,
				ipAddress: l.ipAddress,
				success: l.success,
				timestamp: l.timestamp.toISOString(),
			})),
		});
	} catch (e) {
		console.error("GET /api/v1/audit/access-logs", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
