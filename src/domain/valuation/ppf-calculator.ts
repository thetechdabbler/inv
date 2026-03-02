/**
 * PPF: interest on lowest balance between 5th and last day of each month; compounded annually (March).
 * Rate configurable per financial year.
 */

import type { Transaction } from "@/domain/portfolio/types";
import {
	getFYEndDate,
	getFYStartDate,
	getFinancialYear,
} from "./financial-year";

export interface PPFCalculatorInput {
	initialBalancePaise: number;
	transactions: Transaction[];
	asOfDate: Date;
	getRateForYear: (financialYear: number) => number;
}

function balanceAtDate(
	startBalancePaise: number,
	transactionsUpTo: Transaction[],
): number {
	let b = startBalancePaise;
	for (const t of transactionsUpTo) {
		if (t.type === "investment") b += t.amountPaise;
		else b -= t.amountPaise;
	}
	return b;
}

/** Returns value in paise (integer). */
export function computePPF(input: PPFCalculatorInput): number {
	const { initialBalancePaise, transactions, asOfDate, getRateForYear } = input;
	const sortedTx = [...transactions].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	);

	const firstTxDate =
		sortedTx.length > 0 ? new Date(sortedTx[0].date) : asOfDate;
	const startFY = getFinancialYear(firstTxDate);
	const endFY = getFinancialYear(asOfDate);
	const fyStartFirst = getFYStartDate(startFY);
	const txBeforeFirstFY = sortedTx.filter(
		(t) => new Date(t.date) < fyStartFirst,
	);
	let openingBalancePaise = balanceAtDate(initialBalancePaise, txBeforeFirstFY);

	for (let fy = startFY; fy <= endFY; fy++) {
		const fyStart = getFYStartDate(fy);
		const fyEnd = getFYEndDate(fy);
		const effectiveEnd = asOfDate <= fyEnd ? asOfDate : fyEnd;
		const txInFY = sortedTx.filter((t) => {
			const d = new Date(t.date);
			return d >= fyStart && d <= effectiveEnd;
		});

		let interestPaise = 0;
		for (let m = 0; m < 12; m++) {
			const monthStart = new Date(fy, 3 + m, 1); // April=3, ..., March=14 (rolls to next year)
			const monthEnd = new Date(
				monthStart.getFullYear(),
				monthStart.getMonth() + 1,
				0,
			);
			const fifth = new Date(
				monthStart.getFullYear(),
				monthStart.getMonth(),
				5,
			);
			if (monthEnd > effectiveEnd) break;
			if (monthEnd < fyStart) continue;

			const txToFifth = txInFY.filter((t) => new Date(t.date) <= fifth);
			const txToEnd = txInFY.filter((t) => new Date(t.date) <= monthEnd);
			const balanceFifth = balanceAtDate(openingBalancePaise, txToFifth);
			const balanceEnd = balanceAtDate(openingBalancePaise, txToEnd);
			const lowestPaise = Math.min(balanceFifth, balanceEnd);
			const rate = getRateForYear(fy);
			interestPaise += Math.round((lowestPaise * (rate / 100)) / 12);
		}

		const txAllInFY = sortedTx.filter((t) => {
			const d = new Date(t.date);
			return d >= fyStart && d <= effectiveEnd;
		});
		const closingBalanceBeforeInterest = balanceAtDate(
			openingBalancePaise,
			txAllInFY,
		);
		openingBalancePaise = closingBalanceBeforeInterest + interestPaise;
	}

	return Math.round(openingBalancePaise);
}
