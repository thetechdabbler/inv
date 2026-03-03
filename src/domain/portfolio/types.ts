/**
 * Portfolio domain types (bolt 001-portfolio-core).
 * ADR-001: All monetary amounts in paise (integer).
 * Account/Transaction type strings (SQLite has no native enums).
 */

export type AccountType =
	| "bank_deposit"
	| "stocks"
	| "mutual_fund"
	| "ppf"
	| "epf"
	| "nps"
	| "gratuity";

export interface Account {
	id: string;
	type: AccountType;
	name: string;
	description: string | null;
	initialBalancePaise: number;
	expectedRatePercent?: number | null;
	expectedMonthlyInvestPaise?: number | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface AccountListItem extends Account {
	currentValuePaise: number;
	totalContributionsPaise: number;
}

export interface CreateAccountInput {
	type: AccountType;
	name: string;
	description?: string | null;
	initialBalancePaise: number;
	expectedRatePercent?: number | null;
	expectedMonthlyInvestPaise?: number | null;
}

export interface UpdateAccountInput {
	name?: string;
	description?: string | null;
	type?: AccountType;
	expectedRatePercent?: number | null;
	expectedMonthlyInvestPaise?: number | null;
}

export const ACCOUNT_TYPES: AccountType[] = [
	"bank_deposit",
	"stocks",
	"mutual_fund",
	"ppf",
	"epf",
	"nps",
	"gratuity",
];

export const NAME_MAX_LENGTH = 100;

// Bolt 002: transactions, valuations, history, performance
export type TransactionType = "investment" | "withdrawal";

export const TRANSACTION_TYPES: TransactionType[] = [
	"investment",
	"withdrawal",
];

export interface Transaction {
	id: string;
	accountId: string;
	date: Date;
	amountPaise: number;
	type: TransactionType;
	description: string | null;
	createdAt: Date;
}

export interface Valuation {
	id: string;
	accountId: string;
	date: Date;
	valuePaise: number;
	createdAt: Date;
}

export interface HistoryEntry {
	id: string;
	date: string;
	type: "investment" | "withdrawal" | "valuation";
	amountOrValuePaise: number;
	description?: string | null;
	createdAt: string;
}

export interface PerformanceSnapshot {
	totalContributionsPaise: number;
	totalWithdrawalsPaise: number;
	netInvestedPaise: number;
	currentValuePaise: number;
	profitLossPaise: number;
	percentReturn: number | null;
}
