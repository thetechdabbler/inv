/**
 * Transaction repository (Prisma) - bolt 001 (contributions), bolt 002 (CRUD).
 */

import type { Transaction, TransactionType } from "@/domain/portfolio/types";
import { prisma } from "./client";

export async function createTransaction(
	accountId: string,
	date: Date,
	amountPaise: number,
	type: TransactionType,
	description?: string | null,
): Promise<Transaction> {
	const t = await prisma.transaction.create({
		data: {
			accountId,
			date,
			amountPaise,
			type,
			description: description?.trim() ?? null,
		},
	});
	return {
		id: t.id,
		accountId: t.accountId,
		date: t.date,
		amountPaise: t.amountPaise,
		type: t.type as TransactionType,
		description: t.description,
		createdAt: t.createdAt,
	};
}

export interface FindByAccountIdOptions {
	from?: Date;
	to?: Date;
	limit?: number;
}

export async function findTransactionsByAccountId(
	accountId: string,
	options?: FindByAccountIdOptions,
): Promise<Transaction[]> {
	const { from, to, limit = 100 } = options ?? {};
	const where: { accountId: string; date?: { gte?: Date; lte?: Date } } = {
		accountId,
	};
	if (from !== undefined || to !== undefined) {
		where.date = {};
		if (from !== undefined) where.date.gte = from;
		if (to !== undefined) where.date.lte = to;
	}
	const take = Math.min(Math.max(1, limit), 500);
	const rows = await prisma.transaction.findMany({
		where,
		orderBy: [{ date: "asc" }, { createdAt: "asc" }],
		take,
	});
	return rows.map((t) => ({
		id: t.id,
		accountId: t.accountId,
		date: t.date,
		amountPaise: t.amountPaise,
		type: t.type as TransactionType,
		description: t.description,
		createdAt: t.createdAt,
	}));
}

export async function sumInvestmentAmountByAccountId(
	accountId: string,
): Promise<number> {
	const result = await prisma.transaction.aggregate({
		where: { accountId, type: "investment" },
		_sum: { amountPaise: true },
	});
	return result._sum.amountPaise ?? 0;
}

/** Total contributions = sum of investment transactions only (for list/display). */
export async function getTotalContributionsForAccountIds(
	accountIds: string[],
): Promise<Map<string, number>> {
	if (accountIds.length === 0) return new Map();
	const inv = await prisma.transaction.groupBy({
		by: ["accountId"],
		_sum: { amountPaise: true },
		where: { accountId: { in: accountIds }, type: "investment" },
	});
	return new Map(inv.map((i) => [i.accountId, i._sum.amountPaise ?? 0]));
}

export async function sumWithdrawalAmountByAccountId(
	accountId: string,
): Promise<number> {
	const result = await prisma.transaction.aggregate({
		where: { accountId, type: "withdrawal" },
		_sum: { amountPaise: true },
	});
	return result._sum.amountPaise ?? 0;
}

export async function getTotalWithdrawalsForAccountIds(
	accountIds: string[],
): Promise<Map<string, number>> {
	if (accountIds.length === 0) return new Map();
	const w = await prisma.transaction.groupBy({
		by: ["accountId"],
		_sum: { amountPaise: true },
		where: { accountId: { in: accountIds }, type: "withdrawal" },
	});
	return new Map(w.map((i) => [i.accountId, i._sum.amountPaise ?? 0]));
}
