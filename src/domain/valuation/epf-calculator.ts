/**
 * EPF: monthly interest on running balance; credited annually.
 * Rate configurable per financial year.
 */

import { getFinancialYear, getFYStartDate, getFYEndDate } from "./financial-year";
import type { Transaction } from "@/domain/portfolio/types";

export interface EPFCalculatorInput {
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
export function computeEPF(input: EPFCalculatorInput): number {
  const { initialBalancePaise, transactions, asOfDate, getRateForYear } = input;
  const sortedTx = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const firstTxDate = sortedTx.length > 0 ? new Date(sortedTx[0].date) : asOfDate;
  const startFY = getFinancialYear(firstTxDate);
  const endFY = getFinancialYear(asOfDate);
  const fyStartFirst = getFYStartDate(startFY);
  const txBeforeFirstFY = sortedTx.filter((t) => new Date(t.date) < fyStartFirst);
  let openingBalancePaise = balanceAtDate(initialBalancePaise, txBeforeFirstFY);

  for (let fy = startFY; fy <= endFY; fy++) {
    const fyStart = getFYStartDate(fy);
    const fyEnd = getFYEndDate(fy);
    const effectiveEnd = asOfDate <= fyEnd ? asOfDate : fyEnd;
    const txInFY = sortedTx.filter((t) => {
      const d = new Date(t.date);
      return d >= fyStart && d <= effectiveEnd;
    });

    const rate = getRateForYear(fy);
    const monthlyRate = rate / 100 / 12;
    let interestForYearPaise = 0;

    for (let m = 0; m < 12; m++) {
      const monthStart = new Date(fy, 3 + m, 1);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      if (monthEnd > effectiveEnd) break;
      if (monthEnd < fyStart) continue;

      const txToMonthEnd = txInFY.filter((t) => new Date(t.date) <= monthEnd);
      const balanceEndMonth = balanceAtDate(openingBalancePaise, txToMonthEnd);
      interestForYearPaise += Math.round(balanceEndMonth * monthlyRate);
    }

    const closingBalanceBeforeInterest = balanceAtDate(openingBalancePaise, txInFY);
    openingBalancePaise = closingBalanceBeforeInterest + interestForYearPaise;
  }

  return Math.round(openingBalancePaise);
}
