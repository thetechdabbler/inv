/**
 * Bank deposit: A = P(1 + r/n)^(nt). User rate and compounding frequency.
 */

import type { Transaction } from "@/domain/portfolio/types";
import type { CompoundingFrequency } from "./types";

export interface DepositCalculatorInput {
	initialBalancePaise: number;
	accountCreatedAt: Date;
	transactions: Transaction[];
	asOfDate: Date;
	ratePercentPerAnnum: number;
	compoundingFrequency: CompoundingFrequency;
}

function periodsPerYear(f: CompoundingFrequency): number {
	switch (f) {
		case "monthly":
			return 12;
		case "quarterly":
			return 4;
		case "annual":
			return 1;
		default:
			return 1;
	}
}

/** Returns value in paise (integer). Each cash flow compounds from its date to asOfDate. */
export function computeDeposit(input: DepositCalculatorInput): number {
	const {
		initialBalancePaise,
		accountCreatedAt,
		transactions,
		asOfDate,
		ratePercentPerAnnum,
		compoundingFrequency,
	} = input;

	const r = ratePercentPerAnnum / 100;
	const n = periodsPerYear(compoundingFrequency);
	const asOfTime = asOfDate.getTime();

	let valuePaise = 0;

	const openTime = accountCreatedAt.getTime();
	const yearsOpen = (asOfTime - openTime) / (365.25 * 24 * 60 * 60 * 1000);
	if (yearsOpen > 0) {
		valuePaise += Math.round(
			initialBalancePaise * Math.pow(1 + r / n, n * yearsOpen),
		);
	} else {
		valuePaise += initialBalancePaise;
	}

	for (const t of transactions) {
		const tDate = new Date(t.date);
		const tTime = tDate.getTime();
		if (tTime > asOfTime) continue;
		const yearsToAsOf = (asOfTime - tTime) / (365.25 * 24 * 60 * 60 * 1000);
		const amount = t.type === "investment" ? t.amountPaise : -t.amountPaise;
		valuePaise += Math.round(amount * Math.pow(1 + r / n, n * yearsToAsOf));
	}

	return Math.round(valuePaise);
}
