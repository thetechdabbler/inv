import * as valuationRepo from "@/infrastructure/prisma/valuation-repository";

export async function deleteValuation(id: string): Promise<boolean> {
	return valuationRepo.deleteValuation(id);
}
