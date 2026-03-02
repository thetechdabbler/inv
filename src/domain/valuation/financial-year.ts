/**
 * Financial year (India: April 1 - March 31).
 * financialYear = calendar year of the April that starts the FY (e.g. 2024 = FY 2024-25).
 */

export function getFinancialYear(date: Date): number {
	const year = date.getFullYear();
	const month = date.getMonth() + 1; // 1-12
	return month >= 4 ? year : year - 1;
}

export function getFYStartDate(financialYear: number): Date {
	return new Date(financialYear, 3, 1); // April 1 (month 0-indexed)
}

export function getFYEndDate(financialYear: number): Date {
	return new Date(financialYear + 1, 2, 31); // March 31
}
