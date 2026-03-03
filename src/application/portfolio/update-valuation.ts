import type { Valuation } from "@/domain/portfolio/types";
import * as valuationRepo from "@/infrastructure/prisma/valuation-repository";

export interface UpdateValuationInput {
	id: string;
	date?: Date;
	valuePaise?: number;
}

export async function updateValuation(
	input: UpdateValuationInput,
): Promise<Valuation | null> {
	return valuationRepo.updateValuation(input.id, {
		date: input.date,
		valuePaise: input.valuePaise,
	});
}
