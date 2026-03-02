/**
 * Account repository implementation (Prisma).
 */

import { prisma } from "./client";
import type {
  Account,
  AccountType,
  CreateAccountInput,
  UpdateAccountInput,
} from "@/domain/portfolio/types";

export async function createAccount(
  input: CreateAccountInput,
): Promise<Account> {
  const account = await prisma.account.create({
    data: {
      type: input.type,
      name: input.name.trim(),
      description: input.description?.trim() ?? null,
      initialBalancePaise: input.initialBalancePaise,
    },
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

export async function findAccountById(id: string): Promise<Account | null> {
  const account = await prisma.account.findUnique({ where: { id } });
  if (!account) return null;
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

export async function findAllAccounts(): Promise<Account[]> {
  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: "asc" },
  });
  return accounts.map((a) => ({
    id: a.id,
    type: a.type as AccountType,
    name: a.name,
    description: a.description,
    initialBalancePaise: a.initialBalancePaise,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));
}

export async function updateAccount(
  id: string,
  input: UpdateAccountInput,
): Promise<Account | null> {
  const account = await prisma.account.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.description !== undefined && {
        description: input.description?.trim() ?? null,
      }),
      ...(input.type !== undefined && { type: input.type }),
    },
  }).catch(() => null);
  if (!account) return null;
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

export async function deleteAccount(id: string): Promise<boolean> {
  const result = await prisma.account.delete({ where: { id } }).catch(() => null);
  return result != null;
}

export async function existsAccount(id: string): Promise<boolean> {
  const count = await prisma.account.count({ where: { id } });
  return count > 0;
}
