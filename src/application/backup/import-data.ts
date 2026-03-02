/**
 * Import backup data (bolt 008). Validates schema and applies in one transaction.
 */

import { prisma } from "@/infrastructure/prisma/client";
import type { ExportSnapshot } from "./export-data";

const SUPPORTED_SCHEMA_VERSION = 1;

export type ImportResult =
	| {
			ok: true;
			counts: { accounts: number; transactions: number; valuations: number };
	  }
	| { error: "validation"; message: string }
	| { error: "schema_version"; message: string };

export async function importFromSnapshot(
	snapshot: ExportSnapshot,
): Promise<ImportResult> {
	if (!snapshot.meta?.schemaVersion) {
		return { error: "validation", message: "Missing meta.schemaVersion" };
	}
	if (snapshot.meta.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
		return {
			error: "schema_version",
			message: `Unsupported schema version ${snapshot.meta.schemaVersion}. Supported: ${SUPPORTED_SCHEMA_VERSION}`,
		};
	}
	const accounts = Array.isArray(snapshot.accounts) ? snapshot.accounts : [];
	const transactions = Array.isArray(snapshot.transactions)
		? snapshot.transactions
		: [];
	const valuations = Array.isArray(snapshot.valuations)
		? snapshot.valuations
		: [];

	try {
		await prisma.$transaction(async (tx) => {
			await tx.valuation.deleteMany({});
			await tx.transaction.deleteMany({});
			await tx.interestRateConfig.deleteMany({});
			await tx.accountMarketConfig.deleteMany({});
			await tx.account.deleteMany({});

			for (const a of accounts) {
				await tx.account.create({
					data: {
						id: a.id,
						type: a.type,
						name: a.name,
						description: a.description ?? null,
						initialBalancePaise: Number(a.initialBalancePaise),
						createdAt: new Date(a.createdAt),
						updatedAt: new Date(a.updatedAt),
					},
				});
			}
			for (const t of transactions) {
				await tx.transaction.create({
					data: {
						id: t.id,
						accountId: t.accountId,
						date: new Date(t.date),
						amountPaise: Number(t.amountPaise),
						type: t.type,
						description: t.description ?? null,
						createdAt: new Date(t.createdAt),
					},
				});
			}
			for (const v of valuations) {
				await tx.valuation.create({
					data: {
						id: v.id,
						accountId: v.accountId,
						date: new Date(v.date),
						valuePaise: Number(v.valuePaise),
						createdAt: new Date(v.createdAt),
					},
				});
			}
		});
	} catch (e) {
		console.error("Import transaction failed", e);
		return {
			error: "validation",
			message: "Import failed: invalid or inconsistent data",
		};
	}
	return {
		ok: true,
		counts: {
			accounts: accounts.length,
			transactions: transactions.length,
			valuations: valuations.length,
		},
	};
}
