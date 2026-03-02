/**
 * AuditLog repository (bolt 008). Append-only.
 */

import { prisma } from "./client";

export interface AuditLogRow {
	id: string;
	entityType: string;
	entityId: string;
	action: string;
	oldValue: string | null;
	newValue: string | null;
	timestamp: Date;
}

export async function createAuditLog(
	entityType: string,
	entityId: string,
	action: string,
	oldValue?: string | null,
	newValue?: string | null,
): Promise<AuditLogRow> {
	const row = await prisma.auditLog.create({
		data: {
			entityType,
			entityId,
			action,
			oldValue: oldValue ?? null,
			newValue: newValue ?? null,
		},
	});
	return {
		id: row.id,
		entityType: row.entityType,
		entityId: row.entityId,
		action: row.action,
		oldValue: row.oldValue,
		newValue: row.newValue,
		timestamp: row.timestamp,
	};
}

export async function findRecentAuditLogs(
	limit = 100,
	since?: Date,
	entityType?: string,
): Promise<AuditLogRow[]> {
	const where: { timestamp?: { gte: Date }; entityType?: string } = {};
	if (since) where.timestamp = { gte: since };
	if (entityType) where.entityType = entityType;
	const rows = await prisma.auditLog.findMany({
		where,
		orderBy: { timestamp: "desc" },
		take: Math.min(limit, 500),
	});
	return rows.map((r) => ({
		id: r.id,
		entityType: r.entityType,
		entityId: r.entityId,
		action: r.action,
		oldValue: r.oldValue,
		newValue: r.newValue,
		timestamp: r.timestamp,
	}));
}
