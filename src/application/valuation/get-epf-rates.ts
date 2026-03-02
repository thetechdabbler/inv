import * as rateRepo from "@/infrastructure/prisma/interest-rate-config-repository";

export async function getEPFRates(): Promise<
  { financialYear: number; ratePercentPerAnnum: number }[]
> {
  const map = await rateRepo.findAllYearsForAccountType("epf");
  return Array.from(map.entries())
    .map(([financialYear, ratePercentPerAnnum]) => ({
      financialYear,
      ratePercentPerAnnum,
    }))
    .sort((a, b) => a.financialYear - b.financialYear);
}
