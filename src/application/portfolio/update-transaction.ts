import type { Transaction, TransactionType } from "@/domain/portfolio/types";
import * as transactionRepo from "@/infrastructure/prisma/transaction-repository";

export interface UpdateTransactionInput {
	id: string;
	date?: Date;
	amountPaise?: number;
	type?: TransactionType;
	description?: string | null;
}

export async function updateTransaction(
	input: UpdateTransactionInput,
): Promise<Transaction | null> {
	return transactionRepo.updateTransaction(input.id, {
		date: input.date,
		amountPaise: input.amountPaise,
		type: input.type,
		description: input.description,
	});
}
