/**
 * GET /api/v1/audit/change-logs (bolt 008).
 */

import { findRecentAuditLogs } from "@/infrastructure/prisma/audit-log-repository";
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
		if (sinceParam && since && Number.isNaN(since.getTime())) {
			return NextResponse.json(
				{ code: "VALIDATION_ERROR", message: "since must be a valid ISO date" },
				{ status: 400 },
			);
		}
		const entityType = url.searchParams.get("entityType") ?? undefined;
		const logs = await findRecentAuditLogs(limit, since, entityType);
		return NextResponse.json({
			logs: logs.map((l) => ({
				id: l.id,
				entityType: l.entityType,
				entityId: l.entityId,
				action: l.action,
				oldValue: l.oldValue,
				newValue: l.newValue,
				timestamp: l.timestamp.toISOString(),
			})),
		});
	} catch (e) {
		console.error("GET /api/v1/audit/change-logs", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
