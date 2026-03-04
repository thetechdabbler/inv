/**
 * Valuation repository implementation (Prisma).
 */

import type { Valuation } from "@/domain/portfolio/types";
import { prisma } from "./client";

export async function createValuation(
	accountId: string,
	date: Date,
	valuePaise: number,
): Promise<Valuation> {
	const v = await prisma.valuation.create({
		data: { accountId, date, valuePaise },
	});
	return {
		id: v.id,
		accountId: v.accountId,
		date: v.date,
		valuePaise: v.valuePaise,
		createdAt: v.createdAt,
	};
}

export async function findLatestValueByAccountId(
	accountId: string,
): Promise<number | null> {
	const v = await prisma.valuation.findFirst({
		where: { accountId },
		orderBy: [{ date: "desc" }, { createdAt: "desc" }],
		select: { valuePaise: true },
	});
	return v?.valuePaise ?? null;
}

export async function findLatestValuationByAccountId(
	accountId: string,
): Promise<{ valuePaise: number; date: Date } | null> {
	const v = await prisma.valuation.findFirst({
		where: { accountId },
		orderBy: [{ date: "desc" }, { createdAt: "desc" }],
		select: { valuePaise: true, date: true },
	});
	return v ? { valuePaise: v.valuePaise, date: v.date } : null;
}

export interface FindValuationsByAccountIdOptions {
	from?: Date;
	to?: Date;
	limit?: number;
}

export async function findValuationsByAccountId(
	accountId: string,
	options?: FindValuationsByAccountIdOptions,
): Promise<Valuation[]> {
	const { from, to, limit = 500 } = options ?? {};
	const where: { accountId: string; date?: { gte?: Date; lte?: Date } } = {
		accountId,
	};
	if (from !== undefined || to !== undefined) {
		where.date = {};
		if (from !== undefined) where.date.gte = from;
		if (to !== undefined) where.date.lte = to;
	}
	const take = Math.min(Math.max(1, limit), 500);
	const rows = await prisma.valuation.findMany({
		where,
		orderBy: [{ date: "asc" }, { createdAt: "asc" }],
		take,
	});
	return rows.map((v) => ({
		id: v.id,
		accountId: v.accountId,
		date: v.date,
		valuePaise: v.valuePaise,
		createdAt: v.createdAt,
	}));
}

export async function getLatestValuesForAccountIds(
	accountIds: string[],
): Promise<Map<string, number>> {
	if (accountIds.length === 0) return new Map();
	const map = new Map<string, number>();
	for (const accountId of accountIds) {
		const v = await prisma.valuation.findFirst({
			where: { accountId },
			orderBy: [{ date: "desc" }, { createdAt: "desc" }],
			select: { valuePaise: true },
		});
		if (v) map.set(accountId, v.valuePaise);
	}
	return map;
}

/** Returns the date of the most recent valuation for each account id. */
export async function getLatestValuationDatesForAccountIds(
	accountIds: string[],
): Promise<Map<string, Date>> {
	if (accountIds.length === 0) return new Map();
	const map = new Map<string, Date>();
	for (const accountId of accountIds) {
		const v = await prisma.valuation.findFirst({
			where: { accountId },
			orderBy: [{ date: "desc" }, { createdAt: "desc" }],
			select: { date: true },
		});
		if (v) map.set(accountId, v.date);
	}
	return map;
}

export async function updateValuation(
	id: string,
	data: { date?: Date; valuePaise?: number },
): Promise<Valuation | null> {
	const existing = await prisma.valuation.findUnique({ where: { id } });
	if (!existing) return null;
	const v = await prisma.valuation.update({
		where: { id },
		data: {
			...(data.date !== undefined && { date: data.date }),
			...(data.valuePaise !== undefined && { valuePaise: data.valuePaise }),
		},
	});
	return {
		id: v.id,
		accountId: v.accountId,
		date: v.date,
		valuePaise: v.valuePaise,
		createdAt: v.createdAt,
	};
}

export async function deleteValuation(id: string): Promise<boolean> {
	const existing = await prisma.valuation.findUnique({ where: { id } });
	if (!existing) return false;
	await prisma.valuation.delete({ where: { id } });
	return true;
}
