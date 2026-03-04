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

/**
 * Builds a flat render context from a PortfolioSnapshot for use with
 * renderTemplate(). Merges optional runtime params (e.g., question, timeHorizonYears)
 * that override or supplement snapshot-derived values.
 */
export function buildRenderContext(
	snapshot: PortfolioSnapshot,
	params?: Record<string, string>,
): Record<string, string> {
	const projectionsSummary = snapshot.deterministicProjections
		? snapshot.deterministicProjections.yearly
				.slice(0, 3)
				.map((p) => `${p.label}: ₹${paiseToINR(p.totalValuePaise)}`)
				.join(", ")
		: "Not available";

	const emp = snapshot.employmentContext?.gratuityAccounts?.[0];
	const yearsOfService = emp?.joiningDate
		? ((Date.now() - new Date(emp.joiningDate).getTime()) /
				(365.25 * 24 * 60 * 60 * 1000))
				.toFixed(1)
		: "N/A";

	const allocationSummary = buildAllocationSummary(snapshot.allocationByType);

	const ctx: Record<string, string> = {
		totalValueINR: paiseToINR(snapshot.totalValuePaise),
		netInvestedINR: paiseToINR(snapshot.netInvestedPaise),
		profitLossINR: paiseToINR(snapshot.profitLossPaise),
		percentReturn: formatPercent(snapshot.percentReturn),
		accountCount: String(snapshot.accounts.length),
		accountSummary: buildAccountSummary(snapshot.accounts),
		allocationSummary,
		currentAllocationSummary: allocationSummary,
		snapshotAt: snapshot.snapshotAt ?? new Date().toISOString(),
		hasProjections: snapshot.deterministicProjections ? "true" : "false",
		projectionsSummary,
		hasEmployment: snapshot.employmentContext ? "true" : "false",
		basicSalaryINR:
			emp?.basicSalaryInr != null ? String(emp.basicSalaryInr) : "N/A",
		joiningDate: emp?.joiningDate ?? "N/A",
		gratuityAccountName: emp?.accountName ?? "N/A",
		yearsOfService,
	};

	return params ? { ...ctx, ...params } : ctx;
}
