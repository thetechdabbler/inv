/**
 * Interest rate config repository (Prisma). PPF/EPF per financial year; deposit per account.
 */

import { prisma } from "./client";
import type {
  InterestRateConfig,
  InterestAccountType,
  CompoundingFrequency,
} from "@/domain/valuation/types";

export async function findForAccountTypeAndYear(
  accountType: "ppf" | "epf",
  financialYear: number,
): Promise<number | null> {
  const row = await prisma.interestRateConfig.findFirst({
    where: { accountType, financialYear, accountId: null },
  });
  return row?.ratePercentPerAnnum ?? null;
}

export async function findAllYearsForAccountType(
  accountType: "ppf" | "epf",
): Promise<Map<number, number>> {
  const rows = await prisma.interestRateConfig.findMany({
    where: { accountType, financialYear: { not: null } },
    select: { financialYear: true, ratePercentPerAnnum: true },
  });
  const map = new Map<number, number>();
  for (const r of rows) {
    if (r.financialYear != null) map.set(r.financialYear, r.ratePercentPerAnnum);
  }
  return map;
}

export async function setRateForYear(
  accountType: "ppf" | "epf",
  financialYear: number,
  ratePercentPerAnnum: number,
): Promise<InterestRateConfig> {
  const existing = await prisma.interestRateConfig.findFirst({
    where: { accountType, financialYear, accountId: null },
  });
  const row = existing
    ? await prisma.interestRateConfig.update({
        where: { id: existing.id },
        data: { ratePercentPerAnnum },
      })
    : await prisma.interestRateConfig.create({
        data: {
          accountType,
          financialYear,
          ratePercentPerAnnum,
          accountId: null,
        },
      });
  return toDomain(row);
}

export async function findDepositConfigForAccount(
  accountId: string,
): Promise<{ ratePercentPerAnnum: number; compoundingFrequency: CompoundingFrequency } | null> {
  const row = await prisma.interestRateConfig.findFirst({
    where: { accountType: "bank_deposit", accountId },
  });
  if (!row || row.compoundingFrequency == null) return null;
  return {
    ratePercentPerAnnum: row.ratePercentPerAnnum,
    compoundingFrequency: row.compoundingFrequency as CompoundingFrequency,
  };
}

export async function setDepositConfigForAccount(
  accountId: string,
  ratePercentPerAnnum: number,
  compoundingFrequency: CompoundingFrequency,
): Promise<InterestRateConfig> {
  const existing = await prisma.interestRateConfig.findFirst({
    where: { accountType: "bank_deposit", accountId },
  });
  const row = existing
    ? await prisma.interestRateConfig.update({
        where: { id: existing.id },
        data: { ratePercentPerAnnum, compoundingFrequency },
      })
    : await prisma.interestRateConfig.create({
        data: {
          accountType: "bank_deposit",
          financialYear: null,
          ratePercentPerAnnum,
          compoundingFrequency,
          accountId,
        },
      });
  return toDomain(row);
}

function toDomain(row: {
  id: string;
  accountType: string;
  financialYear: number | null;
  ratePercentPerAnnum: number;
  compoundingFrequency: string | null;
  accountId: string | null;
  effectiveFrom: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): InterestRateConfig {
  return {
    id: row.id,
    accountType: row.accountType as InterestAccountType,
    financialYear: row.financialYear,
    ratePercentPerAnnum: row.ratePercentPerAnnum,
    compoundingFrequency: row.compoundingFrequency as CompoundingFrequency | null,
    accountId: row.accountId,
    effectiveFrom: row.effectiveFrom,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
