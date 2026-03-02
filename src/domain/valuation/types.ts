/**
 * Valuation engine domain types (bolt 003).
 * ADR-001: amounts in paise.
 */

export type InterestAccountType = "ppf" | "epf" | "bank_deposit";

export type CompoundingFrequency = "monthly" | "quarterly" | "annual";

export interface InterestRateConfig {
  id: string;
  accountType: InterestAccountType;
  financialYear: number | null;
  ratePercentPerAnnum: number;
  compoundingFrequency: CompoundingFrequency | null;
  accountId: string | null;
  effectiveFrom: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComputedValuation {
  accountId: string;
  valuePaise: number;
  asOfDate: Date;
  method: "ppf" | "epf" | "deposit";
}

export const DEFAULT_PPF_RATE = 7.1;
export const DEFAULT_EPF_RATE = 8.25;
