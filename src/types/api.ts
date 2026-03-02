/**
 * API response types for UI (bolt 009).
 */

export interface AuthStatus {
	configured: boolean;
	authenticated?: boolean;
}

export interface AccountListItem {
	id: string;
	type: string;
	name: string;
	description: string | null;
	initialBalancePaise: number;
	currentValuePaise?: number;
	totalContributionsPaise?: number;
	createdAt: string;
	updatedAt: string;
}

export interface AccountsResponse {
	accounts: AccountListItem[];
}

export interface PerformanceSnapshot {
	totalContributionsPaise: number;
	totalWithdrawalsPaise: number;
	netInvestedPaise: number;
	currentValuePaise: number;
	profitLossPaise: number;
	percentReturn: number | null;
}

export const ACCOUNT_TYPES = [
	"bank_deposit",
	"stocks",
	"mutual_fund",
	"ppf",
	"epf",
	"nps",
	"gratuity",
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const TRANSACTION_TYPES = ["investment", "withdrawal"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];
