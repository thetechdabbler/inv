/**
 * Update account use case.
 */

import * as accountRepo from "@/infrastructure/prisma/account-repository";
import type { Account, UpdateAccountInput } from "@/domain/portfolio/types";

export async function updateAccount(
  id: string,
  input: UpdateAccountInput,
): Promise<Account | null> {
  const exists = await accountRepo.existsAccount(id);
  if (!exists) return null;
  return accountRepo.updateAccount(id, input);
}
