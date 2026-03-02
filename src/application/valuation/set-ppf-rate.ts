import * as rateRepo from "@/infrastructure/prisma/interest-rate-config-repository";

export async function setPPFRate(
  financialYear: number,
  ratePercentPerAnnum: number,
): Promise<{ financialYear: number; ratePercentPerAnnum: number }> {
  await rateRepo.setRateForYear("ppf", financialYear, ratePercentPerAnnum);
  return { financialYear, ratePercentPerAnnum };
}
