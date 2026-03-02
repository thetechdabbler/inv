/**
 * Log a transaction (investment or withdrawal).
 * Returns the created transaction or null if account not found.
 */

import type { Transaction, TransactionType } from "@/domain/portfolio/types";
import * as accountRepo from "@/infrastructure/prisma/account-repository";
import * as transactionRepo from "@/infrastructure/prisma/transaction-repository";

export interface LogTransactionInput {
	accountId: string;
	date: Date;
	amountPaise: number;
	type: TransactionType;
	description?: string | null;
}

export async function logTransaction(
	input: LogTransactionInput,
): Promise<Transaction | null> {
	const exists = await accountRepo.existsAccount(input.accountId);
	if (!exists) return null;
	return transactionRepo.createTransaction(
		input.accountId,
		input.date,
		input.amountPaise,
		input.type,
		input.description,
	);
}
