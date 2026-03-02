import * as accountRepo from "@/infrastructure/prisma/account-repository";
import * as rateRepo from "@/infrastructure/prisma/interest-rate-config-repository";
import type { CompoundingFrequency } from "@/domain/valuation/types";

export async function setDepositConfig(
  accountId: string,
  ratePercentPerAnnum: number,
  compoundingFrequency: CompoundingFrequency,
): Promise<{ ratePercentPerAnnum: number; compoundingFrequency: CompoundingFrequency } | null> {
  const account = await accountRepo.findAccountById(accountId);
  if (!account) return null;
  await rateRepo.setDepositConfigForAccount(
    accountId,
    ratePercentPerAnnum,
    compoundingFrequency,
  );
  return { ratePercentPerAnnum, compoundingFrequency };
}
