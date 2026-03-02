/**
 * Create account use case (creates account + initial valuation in one transaction).
 */

import { prisma } from "@/infrastructure/prisma/client";
import type {
  Account,
  AccountType,
  CreateAccountInput,
} from "@/domain/portfolio/types";

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
