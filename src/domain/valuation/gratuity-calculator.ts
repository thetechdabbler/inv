import type { Account } from "@/domain/portfolio/types";

export interface GratuityCalculatorInput {
	account: Account;
	basicSalaryInr: number;
	joiningDate: Date;
	asOfDate: Date;
}

export interface GratuitySuggestion {
	accountId: string;
	asOfDate: Date;
	basicSalaryInr: number;
	yearsOfService: number;
	suggestedGratuityInr: number;
	method: "gratuity_formula_v1";
}

function computeServiceYears(joiningDate: Date, asOfDate: Date): number {
	const diffMs = asOfDate.getTime() - joiningDate.getTime();
	if (diffMs <= 0) return 0;
	const yearsFloat = diffMs / (365.25 * 24 * 60 * 60 * 1000);
	const years = Math.round(yearsFloat);
	return years > 0 ? years : 0;
}

function computeGratuityAmount(
	basicSalaryInr: number,
	yearsOfService: number,
): number {
	if (!Number.isFinite(basicSalaryInr) || basicSalaryInr <= 0) return 0;
	if (!Number.isFinite(yearsOfService) || yearsOfService <= 0) return 0;
	const raw = (15 / 26) * basicSalaryInr * yearsOfService;
	return Number(raw.toFixed(2));
}

export function computeGratuitySuggestion(
	input: GratuityCalculatorInput,
): GratuitySuggestion | null {
	const { account, basicSalaryInr, joiningDate, asOfDate } = input;
	if (account.type !== "gratuity") return null;

	const yearsOfService = computeServiceYears(joiningDate, asOfDate);
	const suggestedGratuityInr = computeGratuityAmount(
		basicSalaryInr,
		yearsOfService,
	);

	return {
		accountId: account.id,
		asOfDate,
		basicSalaryInr,
		yearsOfService,
		suggestedGratuityInr,
		method: "gratuity_formula_v1",
	};
}

