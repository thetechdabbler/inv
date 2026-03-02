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
}

export interface UpdateAccountInput {
  name?: string;
  description?: string | null;
  type?: AccountType;
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
