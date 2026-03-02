import * as rateRepo from "@/infrastructure/prisma/interest-rate-config-repository";

export async function setEPFRate(
	financialYear: number,
	ratePercentPerAnnum: number,
): Promise<{ financialYear: number; ratePercentPerAnnum: number }> {
	await rateRepo.setRateForYear("epf", financialYear, ratePercentPerAnnum);
	return { financialYear, ratePercentPerAnnum };
}
