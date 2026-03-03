import * as transactionRepo from "@/infrastructure/prisma/transaction-repository";

export async function deleteTransaction(id: string): Promise<boolean> {
	return transactionRepo.deleteTransaction(id);
}
