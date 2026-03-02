/**
 * Update account use case.
 */

import type { Account, UpdateAccountInput } from "@/domain/portfolio/types";
import * as accountRepo from "@/infrastructure/prisma/account-repository";

export async function updateAccount(
	id: string,
	input: UpdateAccountInput,
): Promise<Account | null> {
	const exists = await accountRepo.existsAccount(id);
	if (!exists) return null;
	return accountRepo.updateAccount(id, input);
}
