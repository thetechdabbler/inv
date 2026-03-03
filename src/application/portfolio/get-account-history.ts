/**
 * Get chronological history (transactions + valuations) for an account.
 */

import type { HistoryEntry } from "@/domain/portfolio/types";
import * as accountRepo from "@/infrastructure/prisma/account-repository";
import * as transactionRepo from "@/infrastructure/prisma/transaction-repository";
import * as valuationRepo from "@/infrastructure/prisma/valuation-repository";

export interface GetAccountHistoryInput {
	accountId: string;
	from?: Date;
	to?: Date;
	limit?: number;
	offset?: number;
}

export interface AccountHistoryResult {
	entries: HistoryEntry[];
	total: number;
}

export async function getAccountHistory(
	input: GetAccountHistoryInput,
): Promise<AccountHistoryResult | null> {
	const exists = await accountRepo.existsAccount(input.accountId);
	if (!exists) return null;
	const limit = Math.min(Math.max(1, input.limit ?? 50), 500);
	const offset = Math.max(0, input.offset ?? 0);
	const [transactions, valuations] = await Promise.all([
		transactionRepo.findTransactionsByAccountId(input.accountId, {
			from: input.from,
			to: input.to,
			limit: 500,
		}),
		valuationRepo.findValuationsByAccountId(input.accountId, {
			from: input.from,
			to: input.to,
			limit: 500,
		}),
	]);
	const entries: HistoryEntry[] = [];
	for (const t of transactions) {
		entries.push({
			id: t.id,
			date: t.date.toISOString().slice(0, 10),
			type: t.type,
			amountOrValuePaise: t.amountPaise,
			description: t.description,
			createdAt: t.createdAt.toISOString(),
		});
	}
	for (const v of valuations) {
		entries.push({
			id: v.id,
			date: v.date.toISOString().slice(0, 10),
			type: "valuation",
			amountOrValuePaise: v.valuePaise,
			createdAt: v.createdAt.toISOString(),
		});
	}
	entries.sort((a, b) => {
		const d = a.date.localeCompare(b.date);
		if (d !== 0) return d;
		return a.createdAt.localeCompare(b.createdAt);
	});
	return {
		entries: entries.slice(offset, offset + limit),
		total: entries.length,
	};
}
