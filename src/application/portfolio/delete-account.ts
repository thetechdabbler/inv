/**
 * Delete account use case (cascade delete; requires confirm flag at API layer).
 */

import * as accountRepo from "@/infrastructure/prisma/account-repository";

export async function deleteAccount(id: string): Promise<boolean> {
  const exists = await accountRepo.existsAccount(id);
  if (!exists) return false;
  return accountRepo.deleteAccount(id);
}
