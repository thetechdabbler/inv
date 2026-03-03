import { computeGratuitySuggestion } from "@/domain/valuation/gratuity-calculator";
import * as accountRepo from "@/infrastructure/prisma/account-repository";

export async function computeGratuitySuggestionForAccount(
	accountId: string,
	basicSalaryInr: number,
	joiningDate: Date,
	asOfDate: Date,
): Promise<
	| {
			suggestedGratuityInr: number;
			yearsOfService: number;
			asOfDate: Date;
	  }
	| null
> {
	const account = await accountRepo.findAccountById(accountId);
	if (!account || account.type !== "gratuity") return null;

	const suggestion = computeGratuitySuggestion({
		account,
		basicSalaryInr,
		joiningDate,
		asOfDate,
	});
	if (!suggestion) return null;

	return {
		suggestedGratuityInr: suggestion.suggestedGratuityInr,
		yearsOfService: suggestion.yearsOfService,
		asOfDate: suggestion.asOfDate,
	};
}

