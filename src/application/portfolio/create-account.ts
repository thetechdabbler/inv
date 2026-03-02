/**
 * Create account use case (creates account + initial valuation in one transaction).
 * Logs audit (bolt 008).
 */

import type {
	Account,
	AccountType,
	CreateAccountInput,
} from "@/domain/portfolio/types";
import { createAuditLog } from "@/infrastructure/prisma/audit-log-repository";
import { prisma } from "@/infrastructure/prisma/client";

export async function createAccount(
	input: CreateAccountInput,
): Promise<Account> {
	const account = await prisma.$transaction(async (tx) => {
		const acc = await tx.account.create({
			data: {
				type: input.type,
				name: input.name.trim(),
				description: input.description?.trim() ?? null,
				initialBalancePaise: input.initialBalancePaise,
			},
		});
		await tx.valuation.create({
			data: {
				accountId: acc.id,
				date: acc.createdAt,
				valuePaise: acc.initialBalancePaise,
			},
		});
		return acc;
	});
	await createAuditLog(
		"account",
		account.id,
		"created",
		null,
		JSON.stringify({ id: account.id, type: account.type, name: account.name }),
	);
	return {
		id: account.id,
		type: account.type as AccountType,
		name: account.name,
		description: account.description,
		initialBalancePaise: account.initialBalancePaise,
		createdAt: account.createdAt,
		updatedAt: account.updatedAt,
	};
}
