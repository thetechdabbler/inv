/**
 * AccessLog repository (bolt 008). Append-only; purge older than 90 days.
 */

import { prisma } from "./client";

const RETENTION_DAYS = 90;

export interface AccessLogRow {
	id: string;
	action: string;
	ipAddress: string;
	success: boolean;
	timestamp: Date;
}

export async function createAccessLog(
	action: string,
	ipAddress: string,
	success: boolean,
): Promise<AccessLogRow> {
	const row = await prisma.accessLog.create({
		data: { action, ipAddress, success },
	});
	return {
		id: row.id,
		action: row.action,
		ipAddress: row.ipAddress,
		success: row.success,
		timestamp: row.timestamp,
	};
}

export async function findRecentAccessLogs(
	limit = 100,
	since?: Date,
): Promise<AccessLogRow[]> {
	const where = since ? { timestamp: { gte: since } } : {};
	const rows = await prisma.accessLog.findMany({
		where,
		orderBy: { timestamp: "desc" },
		take: Math.min(limit, 500),
	});
	return rows.map((r) => ({
		id: r.id,
		action: r.action,
		ipAddress: r.ipAddress,
		success: r.success,
		timestamp: r.timestamp,
	}));
}

export async function purgeOlderThan(date: Date): Promise<number> {
	const result = await prisma.accessLog.deleteMany({
		where: { timestamp: { lt: date } },
	});
	return result.count;
}

export async function maybePurgeOldAccessLogs(): Promise<void> {
	const cutoff = new Date();
	cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
	await purgeOlderThan(cutoff);
}
