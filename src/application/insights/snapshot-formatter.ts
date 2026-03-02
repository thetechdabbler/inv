/**
 * Shared formatting helpers for converting PortfolioSnapshot fields into
 * human-readable strings for LLM prompts. Token-optimised: rounds to INR.
 */

import type { PortfolioSnapshot } from "@/domain/insights/types";

/** Convert paise integer to rounded INR string (e.g. 150050 → "1,501"). */
export function paiseToINR(paise: number): string {
	return Math.round(paise / 100).toLocaleString("en-IN");
}

/** Format percentReturn for display (e.g. 12.3 → "12.3%", null → "N/A"). */
export function formatPercent(value: number | null): string {
	return value !== null ? `${value.toFixed(1)}%` : "N/A";
}

/** Summarise top accounts for prompt (capped at 5 to limit tokens). */
export function buildAccountSummary(
	accounts: PortfolioSnapshot["accounts"],
): string {
	if (accounts.length === 0) return "none";
	const top = accounts
		.slice()
		.sort((a, b) => b.currentValuePaise - a.currentValuePaise)
		.slice(0, 5);
	const summary = top
		.map((a) => `${a.name} (${a.type}, ₹${paiseToINR(a.currentValuePaise)})`)
		.join("; ");
	return accounts.length > 5
		? `${summary}; +${accounts.length - 5} more`
		: summary;
}

/** Summarise allocation by type, sorted by value descending. */
export function buildAllocationSummary(
	allocationByType: Record<string, number>,
): string {
	const entries = Object.entries(allocationByType).sort(
		([, a], [, b]) => b - a,
	);
	if (entries.length === 0) return "none";
	return entries
		.map(([type, paise]) => `${type}: ₹${paiseToINR(paise)}`)
		.join(", ");
}
